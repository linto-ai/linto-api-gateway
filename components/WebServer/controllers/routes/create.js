const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:create')
const { createProxyMiddleware } = require('http-proxy-middleware')

const webserver_middlewares = require(`${process.cwd()}/components/WebServer/middlewares`)
const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

async function create(webServer, serviceToStart) {
  try {
    // let serviceHost = 'http://' + serviceToStart.serviceName
    let serviceHost = 'http://dev.linto.local' //TODO: User serviceName as host

    if (serviceToStart.label.port)
      serviceHost += `:${serviceToStart.label.port}`


    const endpoints = serviceToStart.label.endpoints
    Object.keys(serviceToStart.label.endpoints).map(endpointPath => {
      const stripPathPrefix = '^' + endpointPath
      const routeConfig = endpoints[endpointPath]

      const loadedMiddleware = loadMiddleware(routeConfig.middlewares)

      const proxy = createProxyMiddleware({
        target: serviceHost,
        pathRewrite: {
          [stripPathPrefix]: '/', // remove the uri endpoint from req
        },
        onProxyReq: async (proxyReq, req, res, next) => {
          req.payload = { ...routeConfig.middlewareConfig }
          await middlewareExec(loadedMiddleware, req, res, next)
        },

        onProxyRes: (async (responseBuffer, proxyRes, req, res) => {
          // debug('TODO: Request is complete, do stuff ?)
        }),

      })
      webServer.app.use(endpointPath, proxy)
    })

  } catch (err) {
    console.error(err)
  }
}

function loadMiddleware(middlewaresList) {
  const middlewares = middlewaresList.map(middleware => {
    if (webserver_middlewares[middleware]) {
      return webserver_middlewares[middleware]
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