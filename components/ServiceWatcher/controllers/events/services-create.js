const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:events:service-create')
const { createProxyMiddleware, responseInterceptor, fixRequestBody } = require('http-proxy-middleware');

const webserver_middlewares = require(`${process.cwd()}/components/WebServer/middlewares`)
const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

module.exports = async function () {
  let webServer = this.app.components.WebServer

  this.on('service-create', (attributes) => {
    const paths = attributes?.containerLabel['linto.api.gateway.service.endpoint']
    if (!paths) throw new ServiceSettingsError()

    // let serviceHost = 'http://' + attributes?.serviceName.replace(attributes?.stackLabel['com.docker.stack.namespace'] + '_', '')
    let serviceHost = 'http://dev.linto.local' //TODO: User serviceName as host
    if (attributes?.containerLabel['linto.api.gateway.service.port'])
      serviceHost += `:${attributes?.containerLabel['linto.api.gateway.service.port']}`


    const serviceMiddlewares = attributes?.containerLabel['linto.api.gateway.service.middlewares']

    let middlewares = loadMiddleware(serviceMiddlewares)


    paths.split(',').map(path => {
      const stripPathPrefix = '^' + path

      const proxy = createProxyMiddleware({
        target: serviceHost,
        pathRewrite: {
          [stripPathPrefix]: '/', // remove the uri endpoint from req
        },
        onProxyReq: async (proxyReq, req, res, next) => {
          req.payload = {
            service: {
              attributes
            }
          }
          await middlewareExec(middlewares, req, res, next)
        },

        onProxyRes: (async (responseBuffer, proxyRes, req, res) => {
          // debug('TODO: Request is complete, do stuff ?)
        }),

      })

      webServer.app.use(path, proxy)
    })


    registerService.call(this, attributes)
  })
}

function loadMiddleware(serviceMiddlewares) {
  let middlewares = []
  serviceMiddlewares.split(',').map(middleware => {
    if (webserver_middlewares[middleware]) {
      middlewares.push(webserver_middlewares[middleware])
    } else {
      console.error(`Middleware ${middleware} unknown`)
      throw new ServiceSettingsError(`Middleware ${middleware} unknown`)
    }
  })

  return middlewares
}

async function middlewareExec(middlewares, req, res, next) {
  middlewares.map(middleware => {
    middleware(req, res, next)
  })
}

function registerService(attributes) {
  this.app.components.ServiceWatcher.services[attributes.serviceName] =
  {
    ...attributes
  }
}