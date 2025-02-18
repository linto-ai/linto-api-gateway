const debug = require('debug')('saas-api-gateway:webserver:api:routes:routes')

module.exports = (webServer) => {
  return {
    '/api-docs': require(`${process.cwd()}/components/WebServer/api-docs`)(webServer),
    '/gateway': [
      ...require('./healthcheck/healthcheck')(webServer),
      ...require('./services/services')(webServer)
    ]
  }
}