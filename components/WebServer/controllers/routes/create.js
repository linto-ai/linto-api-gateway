const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:create')
const { createProxyMiddleware } = require('http-proxy-middleware')

const webserver_middlewares = require(`${process.cwd()}/components/WebServer/middlewares`)
const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

const fs = require('fs')
const FormData = require('form-data');

const axios = require('axios')

async function create(webServer, serviceToStart) {
  try {
    let serviceHost = 'http://' + serviceToStart.serviceName

    if (serviceToStart.label.port)
      serviceHost += `:${serviceToStart.label.port}`

    const endpoints = serviceToStart.label.endpoints
    Object.keys(serviceToStart.label.endpoints).map(endpointPath => {
      const routeConfig = endpoints[endpointPath]
      const loadedMiddleware = loadMiddleware(routeConfig.middlewares)

      let proxyMiddleware = async function (req, res, next) {
        //get method from req

        req.payload = { ...routeConfig.middlewareConfig }
        await middlewareExec(loadedMiddleware, req, res)

        const method = req.method
        const path = req.path.replace(endpointPath, '')
        const requestUri = serviceHost + path

        const { headers, files } = req

        const options = {
          method: method,
          url: requestUri,
          headers: headers,
        }


        if (method === 'GET' || method === 'DELETE') {
          await axios(options).then(function (response) {
            res.status(200).send(response.data)
          }).catch(function (error) {
            res.status(500).send(error)
          })
        } else if (method === 'POST' || method === 'PUT') {
          if (options.headers['content-type'].indexOf('multipart/form-data') > -1) {
            const form = new FormData();
            form.append('transcriptionConfig', '{}')
            // form.append('file', files.file.data, { filename: files.file.name })
            let filePath = '/home/yhoupert/Music/small_conv.wav'
            // fs.writeFileSync('/home/yhoupert/Work/linto/dev_v2/platform/saas-api-gateway/test.wav', files.file.data)
            form.append('file', fs.createReadStream(filePath))

            await axios.post(options.url,
              form,
              {
                headers: { ...options.headers },
              }).then(function (response) {
                res.status(200).send(response.data)
                return response.data
              }).catch(function (error) {
                res.status(400).send(error)
              })
          }
        } else {
          res.status(400).send('Method not supported')
        }
      }
      debug('registering route', endpointPath, 'to', serviceHost)
      webServer.app.use(endpointPath, proxyMiddleware)
    })

    //TODO: previous proxy
    // Object.keys(serviceToStart.label.endpoints).map(endpointPath => {
    //   const routeConfig = endpoints[endpointPath]

    //   const loadedMiddleware = loadMiddleware(routeConfig.middlewares)

    //   const proxy = createProxyMiddleware({
    //     target: serviceHost,
    //     changeOrigin: true,
    //     pathRewrite: {
    //       [endpointPath]: '/', // remove the uri endpoint from req
    //     },
    //     onProxyReq: async (proxyReq, req, res, next) => {
    //       req.payload = { ...routeConfig.middlewareConfig }
    //       await middlewareExec(loadedMiddleware, req, res, next)
    //     },
    //   })
    //   webServer.app.use(endpointPath, proxy)
    // })

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