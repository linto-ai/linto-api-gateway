const debug = require('debug')('saas-api-gateway:webserver:middlewares:logs')


module.exports = async (req, res, next) => {
  try {
    debug('Logs middlewares is enable')
    if (typeof next === 'function') next()
    else return
  } catch (error) {
    debug('err')
    res.status(error.status).send({ message: error.message })
  }
}