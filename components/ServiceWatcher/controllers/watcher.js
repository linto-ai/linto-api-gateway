const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:watcher')
const _ = require('lodash');

const Docker = require('dockerode')
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

const { Service } = require('./lib/service')

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
  listService.map(async serviceAlive => {
    const serviceInspect = await docker.getService(serviceAlive.ID).inspect()
    const service = new Service(serviceInspect?.Spec.Name, serviceInspect)

    if (service.isEnable()) {
      this.emit(`service-create`, service)
    }
  })
}

async function dockerService(Type, Action, Actor) {
  try {
    const id = Actor?.ID
    const serviceName = Actor?.Attributes?.name
    let service = new Service(serviceName)

    if (Action === 'remove') {
      if (this.servicesLoaded[service.name]) this.emit(`${Type}-${Action}`, this.servicesLoaded[service.name]) // service-remove

    } else {
      const serviceInspect = await docker.getService(id).inspect()

      service.setServiceInspectMetadata(serviceInspect)

      if (service.isEnable()) {

        if (Action === 'create') {
          this.emit(`${Type}-${Action}`, service) // service-create
        } else if (Action === 'update') {
          if (serviceInspect.PreviousSpec && !compareDockerSpec(serviceInspect)) { // Verify if the service was previously running
            this.emit(`${Type}-${Action}`, service) // service-update
          } else {
            debug('No change detected for service update')
          }
        }
      }
    }
  } catch (err) {
    console.error(err)
  }
}

function compareDockerSpec(serviceInspect) {
  const spec = serviceInspect?.Spec?.Labels
  const previousSpec = serviceInspect?.PreviousSpec?.Labels
  return _.isEqual(spec, previousSpec)
}
