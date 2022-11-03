const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:create')

const webserver_middlewares = require(`${process.cwd()}/components/WebServer/middlewares`)
const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

const httpProxy = require('http-proxy')

async function create(serviceToStart) {
  try {
    let serviceHost = 'http://' + serviceToStart.serviceName

    if (serviceToStart.label.port)
      serviceHost += `:${serviceToStart.label.port}`

    const endpoints = serviceToStart.label.endpoints

    Object.keys(serviceToStart.label.endpoints).map(endpointPath => {
      const routeConfig = endpoints[endpointPath]
      const loadedMiddleware = loadMiddleware(routeConfig.middlewares)

      let proxy = httpProxy.createProxyServer({})

      proxy.on('error', function(err) {
        console.error(err)
      })

      debug(`Create route ${endpointPath} for service ${serviceToStart.serviceName}`)

      this.express.use(endpointPath, async (req, res, next) => {
        // Execute middleware
        req.payload = { ...routeConfig.middlewareConfig }
        await middlewareExec(loadedMiddleware, req, res, undefined)

        // Proxy request
        proxy.web(req, res, { target: serviceHost })

      })
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

async function middlewareExec(middlewares, req, res, next = undefined) {
  middlewares.map(middleware => {
    middleware(req, res, next)
  })
}

module.exports = {
  create
}