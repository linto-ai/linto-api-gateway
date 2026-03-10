const debug = require('debug')('saas-api-gateway:components:webserver:controllers:eventsFrom:ApiWatcher:api-restore')
const { createRoute } = require(`${process.cwd()}/components/WebServer/controllers/lib/`)

let isRegistered = false

module.exports = async function () {
  if (isRegistered) return

  if (!this.app.components['ApiWatcher']) return
  this.app.components['ApiWatcher'].on('api-restore', async (type, serviceToRestore) => {
    debug(`Restoring route for service ${serviceToRestore.serviceName}`)
    createRoute.call(this, serviceToRestore)
  })

  isRegistered = true
}
