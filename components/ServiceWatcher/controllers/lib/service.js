const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:lib:service')

const { NotGatewayService, ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

class Service {
  constructor(serviceName, serviceInspect) {
    this.label = {
      enable: false
    }
    this.stack = {}
    this.name = serviceName

    if (serviceInspect) this.setServiceInspectMetadata(serviceInspect)
  }

  setServiceInspectMetadata(serviceInspect) {
    let containerLabel = serviceInspect?.Spec?.TaskTemplate?.ContainerSpec?.Labels
    let stackLabel = serviceInspect?.Spec?.Labels

    if (containerLabel['linto.gateway.service.enable'] === 'true')
      this.label.enable = true
    else return

    const endpoints = containerLabel['linto.gateway.service.enable']
    if (!endpoints) throw new ServiceSettingsError()

    this.label.endpoints = containerLabel['linto.gateway.service.endpoints']
    this.label.middlewares = containerLabel['linto.gateway.service.middlewares']
    this.label.port = containerLabel['linto.gateway.service.port']
    this.label.desc = containerLabel['linto.gateway.service.desc']

    this.stack.image = stackLabel['com.docker.stack.image']
    this.stack.namespace = stackLabel['com.docker.stack.namespace']
    this.stack.name = containerLabel['com.docker.stack.namespace']

    this.serviceName = this.name.replace(this.stack.namespace + '_', '')
  }

  isEnable() {
    return this.label.enable
  }

}

module.exports = {
  Service
}



