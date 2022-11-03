const debug = require('debug')('saas-api-gateway:webserver:middlewares:auth')

const {
  AuthsError,
} = require(`${process.cwd()}/components/WebServer/error/exception/auths`)

module.exports = async (req, res, next) => {
  try {
    debug('Auth middlewares is enabled')
    debug(req.payload.auths)

    if (typeof next === 'function') next()
    else return
  } catch (error) {
    console.error(error)
    // res.status(error.status).send({ message: error.message })
  }
}