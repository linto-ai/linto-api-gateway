const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:available')

async function available(serviceToStart, servicesLoaded) {
  try {
    if (Object.keys(servicesLoaded).length === 0) return true

    for (const runningService in servicesLoaded) {
      if (runningService !== serviceToStart.name) {
        for (const serviceEndpoint in serviceToStart.label.endpoints) {
          for (const runningServiceEndpoint in servicesLoaded[runningService].label.endpoints) {
            if (serviceEndpoint === runningServiceEndpoint) return false
          }
        }
      }
    }
    
    return true
  } catch (err) {
    console.error(err)
  }
}


module.exports = {
  available
}