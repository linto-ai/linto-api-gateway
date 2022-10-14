const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:events:service-create')

const { availableRoute, createRoute } = require(`${process.cwd()}/components/WebServer/controllers/routes/`)

module.exports = async function () {
  let webServer = this.app.components.WebServer
  let servicesLoaded = this.servicesLoaded

  this.on('service-create', async (serviceConfig) => {
    try {
      if (await availableRoute(serviceConfig, servicesLoaded)) {
        await createRoute(webServer, serviceConfig)
        this.app.components.ServiceWatcher.servicesLoaded[serviceConfig.name] = serviceConfig
      } else {
        debug('Requested endpoint is not available for the service ' + serviceConfig.name)
      }
    } catch (err) {
      console.error(err)
    }
  })
}