const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:events:service-update')

const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

const { availableRoute, createRoute, removeRoute } = require(`${process.cwd()}/components/WebServer/controllers/routes/`)


module.exports = async function () {
  let webServer = this.app.components.WebServer
  let servicesLoaded = this.servicesLoaded

  this.on('service-update', async (newServiceConfig) => {
    try {
      if (await availableRoute(newServiceConfig, servicesLoaded)) {
        const previouServiceConfig = this.app.components.ServiceWatcher.servicesLoaded[newServiceConfig.name]

        await removeRoute(webServer, previouServiceConfig)
        delete this.app.components.ServiceWatcher.servicesLoaded[newServiceConfig.name]

        await createRoute(webServer, newServiceConfig)
        this.app.components.ServiceWatcher.servicesLoaded[newServiceConfig.name] = newServiceConfig
      }
    } catch (err) {
      console.error(err)
    }
  })
}