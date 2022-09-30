const { create } = require(`${process.cwd()}/components/WebServer/controllers/routes/create`)
const { remove } = require(`${process.cwd()}/components/WebServer/controllers/routes/remove`)


module.exports = {
  createRoute : create,
  removeRoute : remove
}