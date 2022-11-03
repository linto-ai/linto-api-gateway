const debug = require('debug')('saas-api-gateway:webserver')
const Component = require(`../component.js`)

const express = require('express')
const bodyParser = require('body-parser')

const WebServerErrorHandler = require('./error/handler')

class WebServer extends Component {
    constructor(app) {
        super(app)
        this.app = app

        this.express = express()
        this.router = express.Router()
        this.id = this.constructor.name

        this.express.set('etag', false)
        this.express.set('trust proxy', true)

        this.express.use(bodyParser.json({
            limit: process.env.EXPRESS_SIZE_FILE_MAX,
            extended: true
        }))
        this.express.use(bodyParser.urlencoded({
            limit: process.env.EXPRESS_SIZE_FILE_MAX,
            extended: true
        }))
        this.express.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*")
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
            next()
        })

        require('./routes/router.js')(this)

        this.express.set('trust proxy', true)
        WebServerErrorHandler.init(this)

        this.express.listen(process.env.SAAS_API_GATEWAY_HTTP_PORT, function () {
            debug(`Express launch on ${process.env.SAAS_API_GATEWAY_HTTP_PORT}`)
        })
        return this.init()
    }
}

module.exports = app => new WebServer(app)