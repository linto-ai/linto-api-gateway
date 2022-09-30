const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:create')
const { createProxyMiddleware } = require('http-proxy-middleware');

const webserver_middlewares = require(`${process.cwd()}/components/WebServer/middlewares`)
const { ServiceSettingsError, ServiceApiEndpointError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

async function create(webServer, attributes, services) {
  try {
    const paths = attributes?.containerLabel['linto.api.gateway.service.endpoint']

    if (!paths) throw new ServiceSettingsError()
    if (!isPathAvailable(paths, services)) throw new ServiceApiEndpointError(paths)

    let serviceHost = 'http://' + attributes?.serviceName.replace(attributes?.stackLabel['com.docker.stack.namespace'] + '_', '')

    if (attributes?.containerLabel['linto.api.gateway.service.port'])
      serviceHost += `:${attributes?.containerLabel['linto.api.gateway.service.port']}`

    const serviceMiddlewares = attributes?.containerLabel['linto.api.gateway.service.middlewares']
    const middlewares = loadMiddleware(serviceMiddlewares)

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

function isPathAvailable(paths, services) {
  let pathAvailable = true

  if (Object.keys(services).length === 0) return pathAvailable

  for (let serviceName in services) {
    paths.split(',').map(path => {
      services[serviceName].containerLabel['linto.api.gateway.service.endpoint'].split(',').map(servicePath => {
        if (servicePath === path) {
          pathAvailable = false
        }
      })
    })
  }
  return pathAvailable
}


module.exports = {
  create
}