const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:lib:existing-service')
const sql = require(`${process.cwd()}/lib/sqlite`)

module.exports = async function existingService(serviceName) {
    return await sql.getServiceByServiceName(serviceName)
}