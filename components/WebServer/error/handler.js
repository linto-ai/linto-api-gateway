const debug = require('debug')('saas-api-gateway:webserver:error:handler')

const ServerException = require('./exception/server')
const GatewayException = require('./exception/gateway')
const AuthsException = require('./exception/auths')
const LogsException = require('./exception/logs')

const JWT_DEFAULT_EXCEPTION = 'UnauthorizedError'// Default JWT exception

let init = function (webserver) {
  //Handle controller exception has API output
  let customException = [JWT_DEFAULT_EXCEPTION]
  Object.keys(LogsException).forEach(key => customException.push(key))
  Object.keys(ServerException).forEach(key => customException.push(key))

  // Exception API output
  Object.keys(GatewayException).forEach(key => customException.push(key))
  Object.keys(AuthsException).forEach(key => customException.push(key))

  webserver.express.use(function (err, req, res, next) {
    if (err) console.error(err)

    if (customException.indexOf(err.name) > -1) {
      res.status(err.status).send({ message: err.message })
      return
    } else if (err) { // Handle unsupported exception
      res.status(500).send({ message: err.message })
      return
    }
    next()
  })
}

module.exports = {
  init
}