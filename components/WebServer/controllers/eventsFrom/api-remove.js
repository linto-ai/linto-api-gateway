const debug = require('debug')('saas-api-gateway:components:webserver:controllers:eventsFrom:ServiceWatcher:api-remove')

const { removeRoute } = require(`${process.cwd()}/components/WebServer/controllers/lib/`)
const sql = require(`${process.cwd()}/lib/sqlite`)

let isRegistered = false

module.exports = async function () {
  if (isRegistered) return
  if (!this.app.components['ApiWatcher']) return
  this.app.components['ApiWatcher'].on('api-remove', async (serviceType, serviceToRemoved) => {
    sql.deleteServices(serviceToRemoved.serviceName)

    removeRoute.call(this, serviceToRemoved)
  })

  isRegistered = true
}
