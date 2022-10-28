const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:create')
const { createProxyMiddleware } = require('http-proxy-middleware')

const webserver_middlewares = require(`${process.cwd()}/components/WebServer/middlewares`)
const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)
const express_proxy = require('express-http-proxy');


async function create(webServer, serviceToStart) {
  try {
    let serviceHost = 'http://' + serviceToStart.serviceName

    if (serviceToStart.label.port)
      serviceHost += `:${serviceToStart.label.port}`


    const endpoints = serviceToStart.label.endpoints
    Object.keys(serviceToStart.label.endpoints).map(endpointPath => {
      const routeConfig = endpoints[endpointPath]

      const loadedMiddleware = loadMiddleware(routeConfig.middlewares)

      const proxy = express_proxy(serviceHost, {

        proxyErrorHandler: function(err, res, next) {
          console.error(err)
          next(err);
        },
        proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
          srcReq.payload = { ...routeConfig.middlewareConfig }
          middlewareExec(loadedMiddleware, srcReq, undefined)
          return proxyReqOpts
        }
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