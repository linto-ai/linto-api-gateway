const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:event:api-remove')
const lib = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/index.js`)

module.exports = async function remove(serviceName) {
    try {
        if (!serviceName) throw new Error('Service name not provided')
        let service = await lib.existing(serviceName)
        if (!service) return

        this.emit(`api-remove`, service.type, service)
        return service
    } catch (err) {
        throw new Error('No service to delete')
    }
}