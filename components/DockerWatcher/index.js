const Component = require(`../component.js`)
const path = require("path")
const debug = require('debug')(`saas-api-gateway:components:docker-watcher`)

class DockerWatcher extends Component {
    constructor(app) {
        super(app)
        this.id = this.constructor.name
        this.app = app
        return this.init()
    }

}

module.exports = app => new DockerWatcher(app)