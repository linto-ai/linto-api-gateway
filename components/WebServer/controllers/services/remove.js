const debug = require('debug')('saas-api-gateway:components:webserver:controllers:services:registry')

async function remove(req, res, next) {
    try {
        if (!req.query.serviceName) {
            res.status(404).send('ServiceName is require')
        } else if (!this.app.components['ApiWatcher']) {
            res.status(404).send('ApiWatcher component not properly loaded')
        } else {
            const result = await this.app.components['ApiWatcher'].remove(req.query.serviceName)
            if (result) res.status(204).send(result)
            else res.status(304).send("No service found to delete")
        }
    } catch (err) {
        next(err)
    }
}


module.exports = {
    remove
}