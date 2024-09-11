const available = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/api-available`)
const list = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/api-list`)
const remove = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/api-remove`)
const registry = require(`${process.cwd()}/components/ApiWatcher/controllers/lib/api-registry`)

module.exports = {
    available: available,
    list: list,
    remove: remove,
    registry: registry,
}