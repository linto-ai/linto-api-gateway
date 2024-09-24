const loadedService = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/list-service`)
const existingService = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/existing-service`)

module.exports = {
    list: loadedService,
    existing: existingService
}