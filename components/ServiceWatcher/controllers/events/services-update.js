const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:events:service-update')

const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

const { createRoute, removeRoute } = require(`${process.cwd()}/components/WebServer/controllers/routes/`)


module.exports = async function () {
  let webServer = this.app.components.WebServer
  let services = this.services

  this.on('service-update', async (updateAttributes) => {
    try {
      const path = updateAttributes?.containerLabel['linto.api.gateway.service.endpoint']
      if (!path) throw new ServiceSettingsError()
      const previousAttributes = this.app.components.ServiceWatcher.services[updateAttributes.serviceName]

      await removeRoute(webServer, previousAttributes)
      delete this.app.components.ServiceWatcher.services[updateAttributes.serviceName]

      await createRoute(webServer, updateAttributes, services)
      this.app.components.ServiceWatcher.services[updateAttributes.serviceName] = { ...updateAttributes }

    } catch (err) {
      console.error(err)
    }
  })
}