const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:create')
const { createProxyMiddleware } = require('http-proxy-middleware')

const webserver_middlewares = require(`${process.cwd()}/components/WebServer/middlewares`)
const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

async function create(webServer, service) {
  try {
    let serviceHost = 'http://' + service.serviceName

    if (service.label.port)
      serviceHost += `:${service.label.port}`

    const middlewares = loadMiddleware(service.label.middlewares)

    service.label.endpoints.split(',').map(endpoint => {
      const stripPathPrefix = '^' + endpoint

      const proxy = createProxyMiddleware({
        target: serviceHost,
        pathRewrite: {
          [stripPathPrefix]: '/', // remove the uri endpoint from req
        },
        onProxyReq: async (proxyReq, req, res, next) => {
          // req.payload = {/*Add metadata for middleware */}
          await middlewareExec(middlewares, req, res, next)
        },

        onProxyRes: (async (responseBuffer, proxyRes, req, res) => {
          // debug('TODO: Request is complete, do stuff ?)
        }),

      })

      webServer.app.use(endpoint, proxy)
    })
  } catch (err) {
    console.error(err)
  }
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

module.exports = {
  create
}