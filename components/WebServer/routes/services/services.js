const debug = require('debug')('saas-api-gateway:webserver:api:routes:api:services')
const { list } = require(process.cwd() + '/components/WebServer/controllers/services/list')

module.exports = (webserver) => {
  return [
    {
      endpoint: '/services',
      method: 'get',
      controller: list.bind(webserver)
    }
  ]
}