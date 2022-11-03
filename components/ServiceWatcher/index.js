const Component = require(`../component.js`)
const debug = require('debug')(`saas-api-gateway:components:docker-watcher`)
const lib = require('./controllers/lib/')

class ServiceWatcher extends Component {
    constructor(app) {
        super(app)
        this.app = app

        this.id = this.constructor.name
        this.servicesLoaded = {}

        this.discovery = lib.discovery.bind(this)
        this.available = lib.available.bind(this)

        return this.init()
    }

}

module.exports = app => new ServiceWatcher(app)