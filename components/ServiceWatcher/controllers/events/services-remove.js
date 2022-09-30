const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:events:service-remove')

const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

const { removeRoute } = require(`${process.cwd()}/components/WebServer/controllers/routes/`)


module.exports = async function () {
  let webServer = this.app.components.WebServer

  this.on('service-remove', async (attributes) => {
    try {
      const path = attributes?.containerLabel['linto.api.gateway.service.endpoint']
      if (!path) throw new ServiceSettingsError()

      await removeRoute(webServer, attributes)
      delete this.app.components.ServiceWatcher.services[attributes.serviceName]

    } catch (err) {
      console.error(err)
    }
  })
}
