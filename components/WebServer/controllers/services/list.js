const debug = require('debug')('saas-api-gateway:components:webserver:controllers:services:list')

async function list(req, res, next) {
  try {
    if (!this.app.components['ServiceWatcher']) {
      res.status(404).send('ServiceWatcher component not properly loaded')
    }else{
      let serviceList = await this.app.components['ServiceWatcher'].list()
      res.status(200).send(serviceList)
    }
  } catch (err) {
    next(err)
  }
}


module.exports = {
  list
}