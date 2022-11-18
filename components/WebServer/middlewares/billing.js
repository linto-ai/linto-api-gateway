const debug = require('debug')('saas-api-gateway:webserver:middlewares:billing')

const {
  BillingError,
} = require(`${process.cwd()}/components/WebServer/error/exception/billing`)

module.exports = async (req, res, next) => {
  try {
    debug('Billing middlewares not yet implemented')

    if (typeof next === 'function') next()
    else return
  } catch (error) {
    console.error(error)
    // res.status(error.status).send({ message: error.message })
  }
}