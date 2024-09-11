const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:lib:api-available')
const axios = require('axios')

module.exports = async function availableService() {
  try {
    for (const [serviceType, services] of Object.entries(this.servicesLoaded)) {
      for (const service of services) {
        try {
          const response = await axios.get(service.host)
          //TODO:
          console.log(`Service ${serviceType} at ${service.host} is available: ${response.status}`)
        } catch (error) {
          this.emit(`api-remove`, serviceType, service)

          console.error(`Service ${serviceType} at ${service.host} is not available: ${error.message}`)
        }
      }
    }
    return true
  } catch (err) {
    console.error(err)
  }
}
