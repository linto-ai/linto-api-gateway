const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:events:service-remove')

const { removeRoute } = require(`${process.cwd()}/components/WebServer/controllers/routes/`)


module.exports = async function () {
  let webServer = this.app.components.WebServer

  this.on('service-remove', async (serviceConfig) => {
    try {
      await removeRoute(webServer, serviceConfig)
      delete this.app.components.ServiceWatcher.servicesLoaded[serviceConfig.name]

    } catch (err) {
      console.error(err)
    }
  })
}