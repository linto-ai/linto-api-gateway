const debug = require('debug')('saas-api-gateway:components:webserver:controllers:routes:remove')

async function remove(webServer, service) {
  try {
    service.label.endpoints.split(',').map(endpoint => {
      let routes = webServer.app._router.stack
      routes.forEach((route, i, routes) => {
        removeRouteFromRouter(route, i, routes, endpoint)
      })
    })
  } catch (err) {
    console.error(err)
  }
}

function removeRouteFromRouter(route, i, routes, endpoint) {
  if (route.regexp.toString().includes(endpoint)) {
    debug(`Remove route ${endpoint}`)
    routes.splice(i, 1)
  }
  if (route.route) route.route.stack.forEach(removeRouteFromRouter)
}

module.exports = {
  remove
}





