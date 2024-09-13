const available = require(`${process.cwd()}/components/ApiWatcher/controllers/event/api-available`)
const list = require(`${process.cwd()}/components/ApiWatcher/controllers/event/api-list`)
const registry = require(`${process.cwd()}/components/ApiWatcher/controllers/event/api-registry`)

module.exports = {
    available: available,
    list: list,
    registry: registry,
}