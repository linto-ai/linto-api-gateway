const available = require(`${process.cwd()}/components/ApiWatcher/controllers/event/api-available`)
const list = require(`${process.cwd()}/components/ApiWatcher/controllers/event/api-list`)
const registry = require(`${process.cwd()}/components/ApiWatcher/controllers/event/api-registry`)
const remove = require(`${process.cwd()}/components/ApiWatcher/controllers/event/api-remove`)

module.exports = {
    available: available,
    list: list,
    registry: registry,
    remove: remove
}