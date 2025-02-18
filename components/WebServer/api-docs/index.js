const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
const swaggerJsdoc = require("swagger-jsdoc")

const gatewayBasePath = process.env.SAAS_API_GATEWAY_BASEPATH || ''
const host = process.env.SAAS_API_GATEWAY_HOST || 'http://localhost'
function forwardedPrefixMiddleware(req, res, next) {
    req.originalUrl = (req.headers['x-forwarded-prefix'] || '') + req.originalUrl
    next()
}

module.exports = (webserver) => {
    console.log(host)
    swaggerDocument.definition.host = host
    swaggerDocument.definition.servers = [{ "url": host + ':' + process.env.SAAS_API_GATEWAY_HTTP_PORT + gatewayBasePath }]
    swaggerDocument.definition.components = {
        ...swaggerDocument.definition.components,
        ...require('./swagger/components/index.js')
    }

    swaggerDocument.definition.components.schemas = {
        ...swaggerDocument.definition.components.schemas,
        ...require(`./swagger/components/schemas/index.js`)
    }
    swaggerDocument.definition.paths = require('./swagger/index.js')

    swaggerDocument.apis = ["./swagger/"]

    //serve swagger
    webserver.express.use('/api-docs/', forwardedPrefixMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerDocument)));
}

