const debug = require('debug')('saas-api-gateway:components:webserver:controllers:eventsFrom:ServiceWatcher:api-remove')

const { removeRoute } = require(`${process.cwd()}/components/WebServer/controllers/lib/`)
let isRegistered = false

module.exports = async function () {
  if (isRegistered) return
  if (!this.app.components['ApiWatcher']) return
  this.app.components['ApiWatcher'].on('api-remove', async (serviceType, serviceToRemoved) => {
    removeRoute.call(this, serviceToRemoved)
    delete this.app.components['ApiWatcher'].remove(serviceType, serviceToRemoved)
  })

  isRegistered = true
}
