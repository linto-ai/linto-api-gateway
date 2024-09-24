const debug = require('debug')('saas-api-gateway:components:webserver:controllers:services:registry')
const TYPE = require(`${process.cwd()}/components/ApiWatcher/controllers/dao/type`)

async function registry(req, res, next) {
    try {
        let type = req.query.type
        if (!type) type = req.body.type

        if (!TYPE.checkValue(req.query.type)) {
            res.status(400).send('Invalid service type')
        } else if (!this.app.components['ApiWatcher']) {
            res.status(404).send('ApiWatcher component not properly loaded')
        } else {
            let result = await this.app.components['ApiWatcher'].registry(type, req.body)
            res.status(201).send(result)
        }
    } catch (err) {
        next(err)
    }
}


module.exports = {
    registry
}