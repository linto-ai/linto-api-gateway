const list = require(`${process.cwd()}/components/WebServer/controllers/services/list`)
const registry = require(`${process.cwd()}/components/WebServer/controllers/services/registry`)
const remove = require(`${process.cwd()}/components/WebServer/controllers/services/remove`)

module.exports = {
    list: list,
    registry: registry,
    remove: remove
}