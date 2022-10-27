const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:lib:service')

const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

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
    let stackLabel = serviceInspect?.Spec?.Labels

    if (stackLabel['linto.gateway.enable'] === 'true')
      this.label.enable = true
    else return

    if (!stackLabel['linto.gateway.endpoints']) throw new ServiceSettingsError()

    this.label.endpoints = this.generateEndpointMiddlewareSettings(stackLabel)

    this.label.port = stackLabel['linto.gateway.port']
    this.label.desc = stackLabel['linto.gateway.desc']

    this.stack.image = stackLabel['com.docker.stack.image']
    this.stack.namespace = stackLabel['com.docker.stack.namespace']
    this.stack.name = stackLabel['com.docker.stack.namespace']

    this.serviceName = this.name.replace(this.stack.namespace + '_', '')
  }

  isEnable() {
    return this.label.enable
  }

  generateEndpointMiddlewareSettings(stackLabel) {
    let endpoints = {}
    stackLabel['linto.gateway.endpoints'].split(',').map(endpoint => {
      const keyName = endpoint

      endpoints[keyName] = { middlewares: [], middlewareConfig: {} }

      const prefixLabel = 'linto.gateway.endpoint.' + endpoint.replace('/', '')

      Object.keys(stackLabel).map(label => {
        if (label.includes(prefixLabel)) {
          const [linto, gateway, endpoint, endpointName, middleware, middlewareName, middlewareConfigKey] = label.split('.')
          if (!endpoints[keyName].middlewareConfig[middlewareName] && middlewareName) {
            endpoints[keyName].middlewareConfig[middlewareName] = {}
          }
          if (!middlewareName) { // Load middleware name
            endpoints['/' + endpointName].middlewares = stackLabel[label].split(',')
          }
          if (middlewareConfigKey) { // Load middleware config
            endpoints['/' + endpointName].middlewareConfig[middlewareName][middlewareConfigKey] = stackLabel[label]
          }

        }
      })
    })
    return endpoints
  }
}

module.exports = {
  Service
}



