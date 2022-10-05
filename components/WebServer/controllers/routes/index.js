const { create } = require(`${process.cwd()}/components/WebServer/controllers/routes/create`)
const { available } = require(`${process.cwd()}/components/WebServer/controllers/routes/available`)
const { remove } = require(`${process.cwd()}/components/WebServer/controllers/routes/remove`)


module.exports = {
  createRoute : create,
  availableRoute : available,
  removeRoute : remove
}