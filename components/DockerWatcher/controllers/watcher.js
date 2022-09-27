const debug = require('debug')('saas-api-gateway:lib:docker-watcher:controllers:watcher')

const Docker = require('dockerode')
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

module.exports = async function () {
  const streamEvent = await docker.getEvents()
  streamEvent.on('data', async buffer => {
    try {
      const { Type, Action, Actor } = JSON.parse(buffer.toString())
      debug(`Docker event : ${Type}-${Action}`)

      if (Type === 'container' && Action === 'start') { //TODO: change to service create
        // if (Actor?.Attributes['linto.api.gateway.enable'] === 'true') {
        //   this.emit('service-create', Actor?.Attributes)
        // }
      } else
        if (Type === 'service') {

          if (Action === 'remove') {
            const serviceMetadata = this.services[Actor?.Attributes?.name] // Get service metadata from component
            this.emit('service-remove', serviceMetadata)
          } else {

            const id = Actor?.ID
            const serviceInspect = await docker.getService(id).inspect()
            if (serviceInspect?.Spec?.TaskTemplate?.ContainerSpec?.Labels['linto.api.gateway.enable'] === 'true') {
              const serviceMetadata = {
                containerLabel: serviceInspect.Spec.TaskTemplate.ContainerSpec.Labels,
                stackLabel: serviceInspect.Spec.Labels,
                serviceName: serviceInspect.Spec.Name
              }
              if (Action === 'create') { //TODO: change to service create
                debug('Should create')
                this.emit('service-create', serviceMetadata)
              } else if (Action === 'update') {
                debug('TODO: WIP do create process atm')
                // this.emit('service-update', serviceMetadata)
              }
            }
          }
        }
    } catch (err) {
      process.stdout.write(`${err.message}\n`)
    }
  })
}