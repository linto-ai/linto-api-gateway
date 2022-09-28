const debug = require('debug')('saas-api-gateway:webserver:middlewares')

// Middleware
const auths = require('./auths')
const logs = require('./logs')

module.exports = {
  auths,
  logs
}