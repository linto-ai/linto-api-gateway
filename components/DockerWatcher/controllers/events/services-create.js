const debug = require('debug')('saas-api-gateway:lib:dockerwebserver:events:services')
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');

const webserver_middlewares = require(`${process.cwd()}/components/WebServer/middlewares`)
const { ServiceSettingsError, ServiceError } = require(`${process.cwd()}/components/DockerWatcher/error/service`)

/*
//TODO: Rename label
labels:
  - "linto.api.gateway.enable=true"
  - "linto.api.gateway.endpoint=/demo"
  - "linto.api.gateway.middlewares=auths,logs"
  - "linto.api.gateway.port=5050"
  gateway.billing.xxx
  gateway.auth.token
*/

module.exports = async function () {
  let webServer = this.app.components.WebServer

  this.on('service-create', (attributes) => {
    const path = attributes?.containerLabel['linto.api.gateway.endpoint']
    const serviceMiddlewares = attributes?.containerLabel['linto.api.gateway.middlewares']

    // let serviceHost = 'http://' + attributes?.serviceName.replace(attributes?.stackLabel['com.docker.stack.namespace'] + '_', '')
    let serviceHost = 'http://dev.linto.local' //TODO: User serviceName as host

    if (attributes?.containerLabel['linto.api.gateway.port']) serviceHost += `:${attributes?.containerLabel['linto.api.gateway.port']}`

    if (!path) throw new ServiceSettingsError()

    let middlewares = []
    serviceMiddlewares.split(',').map(middleware => {
      if (webserver_middlewares[middleware]) {
        middlewares.push(webserver_middlewares[middleware])
      } else {
        console.error(`Middleware ${middleware} unknown`)
        throw new ServiceSettingsError(`Middleware ${middleware} unknown`)
      }
    })

    const stripPathPrefix = '^' + path
    const proxy = createProxyMiddleware({
      target: serviceHost,
      pathRewrite: {
        [stripPathPrefix]: '/', // remove the uri endpoint from req
      },
      onProxyReq: async (proxyReq, req, res, next) => {
        await middlewareExec(middlewares, req, res, next)
      }
    })

    webServer.app.use(path, proxy)


    registerService.call(this, attributes)
  })
}

async function middlewareExec(middlewares, req, res, next) {
  middlewares.map(middleware => {
    middleware(req, res, next)
  })
}

function registerService(attributes) {
  this.services = {
    [attributes.serviceName]:
    {
      ...attributes
    }
  }
}