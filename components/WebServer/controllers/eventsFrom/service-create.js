const debug = require('debug')('saas-api-gateway:components:webserver:controllers:eventsFrom:ServiceWatcher:service-create')

const { createRoute, removeRoute } = require(`${process.cwd()}/components/WebServer/controllers/lib/`)

let isRegistered = false

module.exports = async function () {
  if (isRegistered) return
  if (!this.app.components['ServiceWatcher']) return

  this.app.components['ServiceWatcher'].on('service-create', async (serviceToStart) => {
    createRoute.call(this, serviceToStart)
    this.app.components['ServiceWatcher'].servicesLoaded[serviceToStart.name] = serviceToStart
  })

  isRegistered = true
}
