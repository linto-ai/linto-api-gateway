const Component = require(`../component.js`)
const debug = require('debug')(`saas-api-gateway:components:api-watcher`)
const lib = require('./controllers/lib/')
const MINUTE = 5

class ApiWatcher extends Component {
    constructor(app) {
        super(app)
        this.app = app

        this.id = this.constructor.name
        this.servicesLoaded = {
            transcription: [],
            nlp: [],
            tts: [],
            services: []
        }

        this.available = lib.available.bind(this)
        this.list = lib.list.bind(this)
        this.remove = lib.remove.bind(this)
        this.registry = lib.registry.bind(this)

        this.availableService()
        return this.init()
    }

    availableService() {
        setInterval(() => this.available(), MINUTE * 60 * 1000) // Run every x minutes
    }

}

module.exports = app => new ApiWatcher(app)