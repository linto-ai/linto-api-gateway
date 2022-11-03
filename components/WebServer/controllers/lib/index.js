const { create } = require(`${process.cwd()}/components/WebServer/controllers/lib/create`)
const { remove } = require(`${process.cwd()}/components/WebServer/controllers/lib/remove`)


module.exports = {
  createRoute : create,
  removeRoute : remove
}