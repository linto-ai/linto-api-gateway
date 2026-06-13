const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:create')

const webserver_middlewares = require(`${process.cwd()}/components/WebServer/middlewares`)
const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

const httpProxy = require('http-proxy')

async function create(serviceToStart) {
  try {
    let serviceHost = serviceToStart.host

    const endpoints = serviceToStart.label.endpoints

    Object.keys(serviceToStart.label.endpoints).map(endpointPath => {
      const routeConfig = endpoints[endpointPath]
      const loadedMiddleware = loadMiddleware(routeConfig.middlewares)

      let proxy = httpProxy.createProxyServer({})

      proxy.on('error', function (err) {
        console.error(err)
      })

      // The WebServer applies bodyParser.json()/urlencoded() globally, which
      // consumes the request stream. Without re-streaming, proxied requests
      // carrying a JSON (or urlencoded) body — e.g. PUT — reach the upstream
      // service with no body and hang. Re-write the parsed body on proxyReq.
      // Multipart bodies are not parsed by bodyParser, so they stream intact.
      proxy.on('proxyReq', function (proxyReq, req) {
        if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
          return
        }
        const contentType = proxyReq.getHeader('Content-Type') || ''
        let bodyData
        if (contentType.includes('application/json')) {
          bodyData = JSON.stringify(req.body)
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          bodyData = require('querystring').stringify(req.body)
        }
        if (bodyData) {
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
          proxyReq.write(bodyData)
        }
      })

      debug(`Create route ${endpointPath} for service ${serviceToStart.serviceName} with host ${serviceHost}`)

      this.express.use(endpointPath, async (req, res, next) => {
        req.payload = { ...routeConfig.middlewareConfig }
        await middlewareExec(loadedMiddleware, req, res, undefined)

        proxy.web(req, res, { target: serviceHost }, function (err) {
          debug(err)
        })
      })
    })

  } catch (err) {
    console.error(err)
  }
}

function loadMiddleware(middlewaresList) {
  if (!middlewaresList || middlewaresList.length === 0) { // Service don't have a mandatory middleware loaded
    return []
  }

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