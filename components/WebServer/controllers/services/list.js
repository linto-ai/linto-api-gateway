const debug = require('debug')('saas-api-gateway:components:webserver:controllers:services:list')

async function list(req, res, next) {
  try {
    if (!this.app.components['ServiceWatcher'] && !this.app.components['ApiWatcher']) {
      res.status(404).send('ServiceWatcher component not properly loaded')

    } else if (this.app.components['ServiceWatcher'] && this.app.components['ApiWatcher']) {
      const serviceList = await this.app.components['ServiceWatcher'].list(req.params.scope)
      const apiList = await this.app.components['ApiWatcher'].list(req.query.scope)

      const services = mergeServiceAndApi(serviceList, apiList)

      res.status(200).send(services)
    } else if (!this.app.components['ApiWatcher']) {
      let serviceList = await this.app.components['ServiceWatcher'].list(req.params.scope)
      res.status(200).send(serviceList)

    } else if (!req.params.scope) {
      let apiList = await this.app.components['ApiWatcher'].list(req.query.scope)
      res.status(200).send(apiList)
    } else res.status(404).send('Require component not properly loaded')

  } catch (err) {
    next(err)
  }
}


function mergeServiceAndApi(serviceList, apiList) {
  let services = {
    transcription: serviceList.transcription.concat(apiList.transcription),
    nlp: serviceList.nlp.concat(apiList.nlp),
    tts: serviceList.tts.concat(apiList.tts),
    services: serviceList.services.concat(apiList.services)
  }

  return services
}

module.exports = {
  list
}