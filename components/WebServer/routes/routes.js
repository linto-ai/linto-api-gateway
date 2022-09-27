const debug = require('debug')('saas-api-gateway:webserver:api:routes:routes')

module.exports = (webServer) => {
  return {
      '/api/test': require('./api/test')(webServer)
  }
}