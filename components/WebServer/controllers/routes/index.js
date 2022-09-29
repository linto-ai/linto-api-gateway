const { create } = require(`${process.cwd()}/components/WebServer/controllers/routes/create`)
// const { update } = require(`${process.cwd()}/components/WebServer/controllers/routes/update`)
// const { delete } = require(`${process.cwd()}/components/WebServer/controllers/routes/delete`)


module.exports = {
  createRoute : create,
  // updateRoute : update,
  // deleteRoute : delete
}