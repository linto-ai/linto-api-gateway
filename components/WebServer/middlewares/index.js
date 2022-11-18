const debug = require('debug')('saas-api-gateway:webserver:middlewares')

// Middleware
const auths = require('./auths')
const billing = require('./billing')
const logs = require('./logs')

module.exports = {
  auths,
  billing,
  logs
}