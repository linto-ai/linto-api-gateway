const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:lib:service-discovery')
const Docker = require('dockerode')
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

const { Service } = require('../dao/service')


module.exports = async function serviceDiscovery() {
  const listService = await docker.listServices()

  listService.map(async serviceAlive => {
    const serviceInspect = await docker.getService(serviceAlive.ID).inspect()
    const service = new Service(serviceInspect?.Spec.Name, serviceInspect)

    if (service.isEnabled() && this.available(service, this.servicesLoaded)) {
      this.emit(`service-create`, service, this.servicesLoaded)
    }
  })
}