const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:event:api-registry')
const axios = require('axios')

const lib = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/index.js`)

async function pingServiceWithTimeout(url, retries = 5, delay = 5000, timeout = 5000) {
    try {
        return await axios.get(url, { timeout })
    } catch (err) {
        if (retries === 0) throw err

        await new Promise(resolve => setTimeout(resolve, delay))
        return pingServiceWithTimeout(url, retries - 1, delay, timeout)
    }
}

module.exports = async function registryService(type, service) {
    try {
        if (!service) return false
        if (!service?.name) throw new Error('Service name not provided')

        const exist = await lib.existing(service.serviceName)
        if (exist) return false // We don't register the service it's already exist

        const endpoints = Object.keys(service.label.endpoints)
        for (const endpoint of endpoints) {
            let available = await lib.availableEndpoint(endpoint)
            if (available.length > 0) return false // The desired endpoint is already define
        }

        let ping = service.host
        if (service.healthcheck) ping = service.healthcheck

        // Check if service is running with a retry up to 150s
        if (service.healthcheck) ping = service.healthcheck

        // Non-blocking ping
        pingServiceWithTimeout(ping)
            .then(() => {
                this.emit(`api-create`, type, service) // Register service only if ping succeeds, otherwise nothing
            })
            .catch(err => {
                // We do nothing, api have already responded
                debug(`Service not available`)
            })

        return service
    } catch (err) {
        debug(`Error: ${err.message}`)
        throw new Error('Service not available')
    }
}