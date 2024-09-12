const debug = require('debug')('saas-api-gateway:components:webserver:controllers:services:list')

async function list(req, res, next) {
  try {
    // Early return if any components not loaded

    const { ServiceWatcher, ApiWatcher } = this.app.components
    if (!ServiceWatcher && !ApiWatcher) return res.status(404).send('ServiceWatcher component not properly loaded')

    let services = await getServiceList(req, ServiceWatcher, ApiWatcher)
    if (req.query.flat === "false") res.status(200).send(services)
    else res.status(200).send(flattenServices(services))

  } catch (err) {
    next(err)
  }
}

async function getServiceList(req, ServiceWatcher, ApiWatcher) {
  let serviceList = [], apiList = []

  if (ServiceWatcher) {
    serviceList = await ServiceWatcher.list(req.params.scope)
  }

  if (ApiWatcher) {
    apiList = await ApiWatcher.list(req.query.scope)
  }

  // Merge service and API lists if both exist, otherwise return the existing one
  return ServiceWatcher && ApiWatcher ? mergeServiceAndApi(serviceList, apiList) : serviceList || apiList
}

// Merges service and API lists
function mergeServiceAndApi(serviceList, apiList) {
  return {
    transcription: (serviceList.transcription || []).concat(apiList.transcription || []),
    nlp: (serviceList.nlp || []).concat(apiList.nlp || []),
    tts: (serviceList.tts || []).concat(apiList.tts || []),
    services: (serviceList.services || []).concat(apiList.services || [])
  }
}

// Flatten all service arrays into one big array
function flattenServices(services) {
  return [].concat(...Object.values(services))
}

module.exports = {
  list
}
