const debug = require('debug')('saas-api-gateway:components:webserver:controllers:eventsFrom:ServiceWatcher:service-update')

const { createRoute, removeRoute } = require(`${process.cwd()}/components/WebServer/controllers/lib/`)


module.exports = async function () {
  if (!this.app.components['ServiceWatcher']) return

  this.app.components['ServiceWatcher'].on('service-update', async (serviceUpdated) => {
    const serviceToRemoved = this.app.components['ServiceWatcher'].servicesLoaded[serviceUpdated.name]

    removeRoute.call(this, serviceToRemoved)
    delete this.app.components['ServiceWatcher'].servicesLoaded[serviceToRemoved.name]

    createRoute.call(this, serviceUpdated)
    this.app.components['ServiceWatcher'].servicesLoaded[serviceUpdated.name] = serviceUpdated
  })
}
