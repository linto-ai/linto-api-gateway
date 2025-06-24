const loadedService = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/list-service`)
const existingService = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/existing-service`)
const availableEndpoint = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/available-endpoint`)

module.exports = {
    list: loadedService,
    existing: existingService,
    availableEndpoint: availableEndpoint
}