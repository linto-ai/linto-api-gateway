const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:lib:api-remove')

module.exports = async function removeService(type, service) {
  try {
    if (!service) return false

    if (!service?.name) {
      throw new Error('Service name not provided')
    }

    this.servicesLoaded[type] = this.servicesLoaded[type].filter(s => s.name !== service.name)
  } catch (err) {
    console.error(err)
  }
}
