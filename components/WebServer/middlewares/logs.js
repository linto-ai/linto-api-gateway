const debug = require('debug')('saas-api-gateway:webserver:middlewares:logs')

const {
  LogsError,
} = require(`${process.cwd()}/components/WebServer/error/exception/logs`)

module.exports = async (req, res, next) => {
  try {
    const { rawHeaders, httpVersion, method, socket, url } = req
    const { remoteAddress, remoteFamily } = socket
    console.log()
    console.log(`Date : ${new Date().toJSON()}`)
    console.log(`New user entry ${method} on ${url}`)
    console.log(`User IP : ${remoteAddress} - ${remoteFamily}`)

    if (typeof next === 'function') next()
    else return
  } catch (error) {
    console.error(error)
    // res.status(error.status).send({ message: error.message })
  }
}