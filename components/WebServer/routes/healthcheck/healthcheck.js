const debug = require('debug')('saas-api-gateway:webserver:api:routes:api:healthcheck')

module.exports = (webserver) => {
  return [
    {
      endpoint: '/healthcheck',
      method: 'get',
      require_logs: true,
      controller: (req, res, next) => {
        res.status(200).send({
          status : 'ok'
        })
      }
    }
  ]
}