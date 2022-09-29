const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:events:service-create')

const { createRoute } = require(`${process.cwd()}/components/WebServer/controllers/routes/`)

module.exports = async function () {
  let webServer = this.app.components.WebServer

  this.on('service-create', (attributes) => {
    createRoute(webServer, attributes)

    registerService.call(this, attributes)
  })
}


function registerService(attributes) {
  this.app.components.ServiceWatcher.services[attributes.serviceName] =
  {
    ...attributes
  }
}