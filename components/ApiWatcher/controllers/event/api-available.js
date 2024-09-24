const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:event:api-available')
const axios = require('axios')
const lib = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/index.js`)


module.exports = async function availableService() {
  try {
    let servicesLoaded = await lib.list()

    for (const [serviceType, services] of Object.entries(servicesLoaded)) {
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
