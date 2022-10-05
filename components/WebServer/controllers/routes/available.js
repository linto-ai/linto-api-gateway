const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:list')

async function available(service, servicesLoaded) {
  try {
    let isAvailable = true
    if (Object.keys(servicesLoaded).length === 0) return isAvailable

    for (const serviceName in servicesLoaded) {
      if (serviceName !== service.name) {
        service.label.endpoints.split(',').map(endpoint => {

          servicesLoaded[serviceName].label.endpoints.split(',').map(serviceEndpoint => {
            if (serviceEndpoint === endpoint) {
              isAvailable = false
            }
          })
        })
      }
      if (!isAvailable) break
    }
    return isAvailable
  } catch (err) {
    console.error(err)
  }
}


module.exports = {
  available
}