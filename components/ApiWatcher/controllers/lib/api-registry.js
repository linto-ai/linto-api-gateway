const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:lib:api-registry')
const TYPE = require(`${process.cwd()}/components/ApiWatcher/controllers/dao/type`)

module.exports = async function registryService(type, service) {
    if (!service) return false

    if (!service?.name) {
        throw new Error('Service name not provided')
    }

    //we check if the service is already registered
    const serviceFind = this.servicesLoaded[type].filter(s => s.name === service.name)
    if (serviceFind.length > 0) return

    this.emit(`api-create`, type, service)
    return service
}