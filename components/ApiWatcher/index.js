const Component = require(`../component.js`)
const debug = require('debug')(`saas-api-gateway:components:api-watcher`)
const event = require(`${process.cwd()}/components/ApiWatcher/controllers/event/index.js`)
const TIMER_MINUTE = parseFloat(process.env.ALIVE_TIMER_SERVICE) || 5 // If NaN, the value will be setup at 5 minute per default

class ApiWatcher extends Component {
    constructor(app) {
        super(app)
        this.app = app
        this.id = this.constructor.name

        // Bind event methods
        const { available, list, registry, remove } = event
        this.available = available.bind(this)
        this.list = list.bind(this)
        this.registry = registry.bind(this)
        this.remove = remove.bind(this)

        this.availableService()
        return this
    }

    availableService() {
        setInterval(() => this.available(), TIMER_MINUTE * 60 * 1000) // Run every x minutes
    }
}

module.exports = app => new ApiWatcher(app)