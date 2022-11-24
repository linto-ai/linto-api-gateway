const debug = require('debug')('saas-api-gateway:webserver:api:routes:routes')

module.exports = (webServer) => {
  return {
    '/gateway': [
      ...require('./healthcheck/healthcheck')(webServer),
      ...require('./services/services')(webServer)
    ]
  }
}