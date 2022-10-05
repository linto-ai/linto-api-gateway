const debug = require('debug')('saas-api-gateway:webserver:api::routes:router')

const middlewares = require(`../middlewares`)

const ifHasElse = (condition, ifHas, otherwise) => {
    return !condition ? otherwise() : ifHas()
}
class Router {
    constructor(webServer) {
        const routes = require('./routes.js')(webServer)
        for (let level in routes) {
            for (let endpoint in routes[level]) {
                let controller = []

                const route = routes[level][endpoint]
                const method = route.method

                // Load middlewares to use before api controller
                if (route.require_logs) controller.push(middlewares.logs)

                // Load Api route controller
                controller.push(
                    ifHasElse(
                        Array.isArray(route.controller),
                        () => Object.values(route.controller),
                        () => route.controller
                    ),
                )

                // Load middlewares to use after api controller
                webServer.app[method](
                    level + route.endpoint,
                    controller
                )
            }
        }
    }
}


module.exports = webServer => new Router(webServer)