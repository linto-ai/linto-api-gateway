const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:event:api-registry')
const axios = require('axios')
const lib = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/index.js`)

module.exports = async function registryService(type, service) {
    try {
        if (!service) return false

        if (!service?.name) throw new Error('Service name not provided')


        let exist = await lib.existing(service.serviceName)
        if (exist) return

        let ping = service.host
        if (service.healthcheck) ping = service.healthcheck

        await axios.get(ping) // axios will throw an error if the service is not available

        this.emit(`api-create`, type, service)
        return service
    } catch (err) {
        throw new Error('Service not available')
    }
}