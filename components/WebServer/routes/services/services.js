const { method } = require('lodash')

const debug = require('debug')('saas-api-gateway:webserver:api:routes:api:services')
const { list } = require(process.cwd() + '/components/WebServer/controllers/services/list')
const { registry } = require(process.cwd() + '/components/WebServer/controllers/services/registry')

module.exports = (webserver) => {
  return [
    {
      endpoint: '/services/',
      method: 'post',
      controller: registry.bind(webserver)
    },
    {
      endpoint: '/services/:scope',
      method: 'get',
      controller: list.bind(webserver)
    },
    {
      endpoint: '/services',
      method: 'get',
      controller: list.bind(webserver)
    }
  ]
}