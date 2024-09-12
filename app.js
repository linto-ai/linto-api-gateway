const debug = require('debug')('saas-api-gateway:app')
const ora = require('ora')

class Ctl {
    constructor() {
        this.init()
    }
    async init() {
        try {
            require('./config')

            this.components = {}
            process.env.COMPONENTS.split(',').reduce((prev, componentFolderName) => {
                return prev.then(async () => { await this.use(componentFolderName) })
            }, Promise.resolve()).then(async () => {
                // Do some stuff after all components being loaded
                if (this.components['ServiceWatcher'] !== undefined && this.components['WebServer'] !== undefined) {
                    await this.components['ServiceWatcher'].discovery()
                }
            })
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    }

    async use(componentFolderName) {
        let spinner = ora(`Registering component : ${componentFolderName}`).start()
        try {
            // Component dependency injections with inversion of control based on events emitted between components
            // Component is an async singleton - requiring it returns a reference to an instance
            const component = await require(`${__dirname}/components/${componentFolderName}`)(this)
            this.components[component.id] = component // We register the instancied component reference in app.components object
            spinner.succeed(`Registered component : ${component.id}`)
        } catch (e) {
            if (e.name == "COMPONENT_MISSING") {
                return spinner.warn(`Skipping ${componentFolderName} - this component depends on : ${e.missingComponents}`)
            }
            spinner.fail(`Error in component loading : ${componentFolderName}`)
            console.error(debug.namespace, e)
            process.exit(1)
        }
    }
}

new Ctl()