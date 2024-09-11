const debug = require('debug')('saas-api-gateway:components:webserver:controllers:eventsFrom:ServiceWatcher:service-remove')

const { removeRoute } = require(`${process.cwd()}/components/WebServer/controllers/lib/`)
let isRegistered = false

module.exports = async function () {
  if (isRegistered) return
  if (!this.app.components['ServiceWatcher']) return

  this.app.components['ServiceWatcher'].on('service-remove', async (serviceToRemoved) => {
    removeRoute.call(this, serviceToRemoved)
    delete this.app.components['ServiceWatcher'].servicesLoaded[serviceToRemoved.name]
  })

  isRegistered = true
}
