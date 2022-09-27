const debug = require('debug')('saas-api-gateway:webserver:api:controller:gateway')

async function discover(req, res, next) {
}

async function callDiscover(req, res, next) {
  res.status(200).send({
    message: 'gateway created'
  })
}

module.exports = {
  discover,
  callDiscover
}