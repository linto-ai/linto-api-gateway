const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:events:service-create')

const { createRoute } = require(`${process.cwd()}/components/WebServer/controllers/routes/`)

module.exports = async function () {
  let webServer = this.app.components.WebServer
  let services = this.services

  this.on('service-create', async (attributes) => {
    try {

      await createRoute(webServer, attributes, services)
      this.app.components.ServiceWatcher.services[attributes.serviceName] = { ...attributes }

    } catch (err) {
      console.error(err)
    }
  })
}