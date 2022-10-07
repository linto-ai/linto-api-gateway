const debug = require('debug')('saas-api-gateway:webserver:middlewares:logs')

const {
  LogsError,
} = require(`${process.cwd()}/components/WebServer/error/exception/logs`)

module.exports = async (req, res, next) => {
  try {
    debug('Logs middlewares is enable')
    debug(req.payload.logs)

    if (typeof next === 'function') next()
    else return
  } catch (error) {
    res.status(error.status).send({ message: error.message })
  }
}