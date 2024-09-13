const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:lib:list-service')
const sql = require(`${process.cwd()}/lib/sqlite`)

module.exports = async function loadedService() {
    let servicesAvailable = await sql.getAllServices()
    let services = {
        transcription: [],
        nlp: [],
        tts: [],
        services: []
    }

    for (let service of servicesAvailable) {
        try {
            service.label = JSON.parse(service.label)
        } catch (err) {
            // do nothing, use the default label
        }
        services[service.type].push(service)
    }

    return services
}