const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:lib:available-endpoint')
const sql = require(`${process.cwd()}/lib/sqlite`)

module.exports = async function availableEndpoint(endpoint) {
    return await sql.getServiceByAvailableEndpoint(endpoint)
}