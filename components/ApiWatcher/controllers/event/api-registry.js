const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:event:api-registry')
const axios = require('axios')

const lib = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/index.js`)

async function pingServiceWithTimeout(url, retries = 5, delay = 5000, timeout = 5000) {
    try {
        return await axios.get(url, { timeout })
    } catch (err) {
        if (retries === 0) throw err

        await new Promise(resolve => setTimeout(resolve, delay))
        return pingServiceWithTimeout(url, retries - 1, delay * 2, timeout) // Exponentially increase the delay
    }
}

module.exports = async function registryService(type, service) {
    try {
        if (!service) return false
        if (!service?.name) throw new Error('Service name not provided')

        let exist = await lib.existing(service.serviceName)
        if (exist) return false // We don't create, service already exist

        let ping = service.host
        if (service.healthcheck) ping = service.healthcheck

        // Check if service is running with a retry up to 150s
        await pingServiceWithTimeout(ping)

        this.emit(`api-create`, type, service)
        return service
    } catch (err) {
        debug(`Error: ${err.message}`)
        throw new Error('Service not available')
    }
}