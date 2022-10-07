const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:events:service-update')

const { availableRoute, createRoute, removeRoute } = require(`${process.cwd()}/components/WebServer/controllers/routes/`)


module.exports = async function () {
  let webServer = this.app.components.WebServer
  let servicesLoaded = this.servicesLoaded
  this.on('service-update', async (serviceUpdated) => {
    try {
      if (await availableRoute(serviceUpdated, servicesLoaded)) {
        const previouService = this.app.components.ServiceWatcher.servicesLoaded[serviceUpdated.name]

        await removeRoute(webServer, previouService)
        delete this.app.components.ServiceWatcher.servicesLoaded[serviceUpdated.name]

        await createRoute(webServer, serviceUpdated)
        this.app.components.ServiceWatcher.servicesLoaded[serviceUpdated.name] = serviceUpdated
      }
    } catch (err) {
      console.error(err)
    }
  })
}