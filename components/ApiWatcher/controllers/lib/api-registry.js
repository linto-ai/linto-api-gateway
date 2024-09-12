const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:lib:api-registry')
const axios = require('axios')

module.exports = async function registryService(type, service) {
    try {
        if (!service) return false

        if (!service?.name) {
            throw new Error('Service name not provided')
        }
        const serviceFind = this.servicesLoaded[type].filter(s => s.name === service.name)
        if (serviceFind.length > 0) return

        let ping = service.host
        if (service.healthcheck) ping = service.healthcheck

        const response = await axios.get(ping)

        this.emit(`api-create`, type, service)
        return service
    } catch (err) {
        debug('Service not available')
    }
}