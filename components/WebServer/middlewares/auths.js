const debug = require('debug')('saas-api-gateway:webserver:middlewares:auth')

const {
  AuthsError,
} = require(`${process.cwd()}/components/WebServer/error/exception/auths`)

module.exports = async (req, res, next) => {
  try {
    //req.payload.service contains docker label and other information
    debug('Auth middlewares is enable')

    if (typeof next === 'function') next()
    else return
  } catch (error) {
    res.status(error.status).send({ message: error.message })
  }
}