const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:lib:api-available')
const axios = require('axios')

module.exports = async function availableService() {
  try {
    for (const [serviceType, services] of Object.entries(this.servicesLoaded)) {
      for (const service of services) {
        try {
          let ping = service.host
          if (service.healthcheck) ping = service.healthcheck

          await axios.get(ping) // axios will throw an error if the service is not available

        } catch (error) {
          this.emit(`api-remove`, serviceType, service)
          console.error(`Service ${serviceType} at ${service.host} is not available: ${error.message}`)
        }
      }
    }
  } catch (err) {
    console.error(err)
  }
}
