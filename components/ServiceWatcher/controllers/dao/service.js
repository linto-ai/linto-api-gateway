const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:lib:service')

const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

class Service {
  constructor(serviceName, serviceInspect) {
    this.label = {
      enabled: false
    }
    this.stack = {}
    this.container = { env: {} }
    this.name = serviceName

    if (serviceInspect) this.setMetadata(serviceInspect)
  }

  setMetadata(serviceInspect) {

    let stackLabel = serviceInspect?.Spec?.Labels

    if (stackLabel['linto.gateway.enable'] === 'true')
      this.label.enabled = true
    else return

    if (!stackLabel['linto.gateway.endpoints']) throw new ServiceSettingsError()

    this.label.endpoints = this.setupMiddlewareSettings(stackLabel)
    if (serviceInspect?.Spec?.TaskTemplate?.ContainerSpec?.Env)
      this.container.env = this.setupEnvSettings(serviceInspect.Spec.TaskTemplate.ContainerSpec.Env)

    this.label.port = stackLabel['linto.gateway.port']
    try {
      this.label.desc = JSON.parse(stackLabel['linto.gateway.desc'])
    } catch (err) {
      this.label.desc = stackLabel['linto.gateway.desc']
    }

    this.stack.image = stackLabel['com.docker.stack.image']
    this.stack.namespace = stackLabel['com.docker.stack.namespace']
    this.stack.name = stackLabel['com.docker.stack.namespace']

    this.serviceName = this.name.replace(this.stack.namespace + '_', '')

    this.host = 'http://' + this.serviceName
    if (this.label.port)
      this.host += `:${this.label.port}`
  }

  isEnabled() {
    return this.label.enabled
  }
  setupEnvSettings(env) {
    let envSettings = {}
    env.map(env => {
      const [key, value] = env.split('=')
      envSettings[key] = value
    })
    return envSettings
  }

  setupMiddlewareSettings(stackLabel) {
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

          if (middlewareConfigKey) { // Load middleware config, that can be a string or a json
            try {
              endpoints['/' + endpointName].middlewareConfig[middlewareName][middlewareConfigKey] = JSON.parse(stackLabel[label])
            } catch (err) {
              endpoints['/' + endpointName].middlewareConfig[middlewareName][middlewareConfigKey] = stackLabel[label]
            }
          }

        }
      })
    })
    return endpoints
  }

  show() {
    let service = Object.assign({}, this)
    delete service.container

    return service
  }
}

module.exports = {
  Service
}



