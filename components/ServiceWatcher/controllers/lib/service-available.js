const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:available')

module.exports = async function availableService(serviceToStart) {
  try {
    if (Object.keys(this.servicesLoaded).length === 0) return true

    for (const runningService in this.servicesLoaded) {
      if (runningService !== serviceToStart.name) {
        for (const serviceEndpoint in serviceToStart.label.endpoints) {
          for (const runningServiceEndpoint in this.servicesLoaded[runningService].label.endpoints) {
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