const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:remove')

const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

async function remove(webServer, attributes) {
  const paths = attributes?.containerLabel['linto.api.gateway.service.endpoint']
  if (!paths) throw new ServiceSettingsError()

  paths.split(',').map(path => {
    let routes = webServer.app._router.stack
    routes.forEach((route, i, routes) => {
      removeRouteFromRouter(route, i, routes, path)
    })
  })
}

function removeRouteFromRouter(route, i, routes, path) {
  if (route.regexp.toString().includes(path)) {
    debug(`Remove route ${path}`)
    routes.splice(i, 1)
  }
  if (route.route) route.route.stack.forEach(removeRouteFromRouter)
}

module.exports = {
  remove
}





