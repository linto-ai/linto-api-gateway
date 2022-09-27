const debug = require('debug')('saas-api-gateway:webserver:api:routes:api:token')

module.exports = (webserver) => {
  return [
    {
      path: '/log',
      method: 'get',
      require_logs: true,
      controller: (req, res, next) => {
        res.status(200).send({
          message: 'My first gateway path'
        })
      }
    }
  ]
}