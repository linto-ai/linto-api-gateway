const debug = require('debug')('saas-api-gateway:webserver:middlewares')

// Middleware
const logs = require('./logs')

module.exports = {
  logs
}