const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:watcher')
const _ = require('lodash');

const Docker = require('dockerode')
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

module.exports = async function () {
  serviceDiscovery.call(this)

  const streamEvent = await docker.getEvents()

  streamEvent.on('data', async buffer => {
    try {
      const { Type, Action, Actor } = JSON.parse(buffer.toString())

      switch (Type) {
        case 'service':
          debug(`Docker event : ${Type}-${Action}`)
          dockerService.call(this, Type, Action, Actor)
          break;
        default:
          debug(`Unmanaged docker type ${Type}-${Action}`)
      }

    } catch (err) {
      process.stdout.write(`${err.message}\n`)
    }
  })
}

async function serviceDiscovery() {
  const listService = await docker.listServices()
  listService.map(async service => {
    const serviceInspect = await docker.getService(service.ID).inspect()

    if (serviceInspect?.Spec?.TaskTemplate?.ContainerSpec?.Labels['linto.api.gateway.service.enable'] === 'true') {
      const serviceName = serviceInspect?.Spec.Name

      const serviceMetadata = generateMetadata(serviceName, serviceInspect)
      this.emit(`service-create`, serviceMetadata)
    }
  })
}


async function dockerService(Type, Action, Actor) {
  const id = Actor?.ID
  const serviceName = Actor?.Attributes?.name

  if (Action === 'remove') {
    const serviceMetadata = this.services[serviceName] // Get service metadata from component
    if (serviceMetadata) this.emit(`${Type}-${Action}`, serviceMetadata) // service-remove

  } else {
    const serviceInspect = await docker.getService(id).inspect()

    if (serviceInspect?.Spec?.TaskTemplate?.ContainerSpec?.Labels['linto.api.gateway.service.enable'] === 'true') {
      const serviceMetadata = generateMetadata(serviceName, serviceInspect)

      if (Action === 'create') {
        this.emit(`${Type}-${Action}`, serviceMetadata) // service-create
      } else if (Action === 'update') {
        if (serviceInspect.PreviousSpec) { // Verify if the service was previously running
          if (!compareSpec(serviceInspect)) {
            this.emit(`${Type}-${Action}`, serviceMetadata) // service-update
          } else {
            debug('No change detected for service update')
          }
        }
      }

    }
  }
}


function generateMetadata(serviceName, serviceInspect) {
  return {
    containerLabel: serviceInspect.Spec.TaskTemplate.ContainerSpec.Labels,
    stackLabel: serviceInspect.Spec.Labels,
    serviceName: serviceName
  }
}

function compareSpec(serviceInspect) {
  const spec = serviceInspect?.Spec?.TaskTemplate?.ContainerSpec?.Labels
  const previousSpec = serviceInspect?.PreviousSpec?.TaskTemplate?.ContainerSpec?.Labels
  return _.isEqual(spec, previousSpec)
}
