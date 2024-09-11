const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:lib:api-list')
const TYPE = require(`${process.cwd()}/components/ApiWatcher/controllers/dao/type`)

module.exports = async function serviceList(scope = undefined) {
  if (TYPE.checkValue(scope)) {
    return this.servicesLoaded[scope]
  } else {
    return this.servicesLoaded
  }
}

