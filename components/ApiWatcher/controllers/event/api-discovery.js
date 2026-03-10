const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:event:api-discovery')
const lib = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/index.js`)

module.exports = async function discovery() {
  try {
    let servicesLoaded = await lib.list()
    for (const [serviceType, services] of Object.entries(servicesLoaded)) {
      for (const service of services) {
        debug(`Restoring service ${service.serviceName} (${serviceType}) from database`)
        this.emit('api-restore', serviceType, service)
      }
    }
  } catch (err) {
    console.error('Error restoring API services from database:', err)
  }
}
