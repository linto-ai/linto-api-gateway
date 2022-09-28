const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:events:service-update')

const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

module.exports = async function () {
  let webServer = this.app.components.WebServer

  this.on('service-update', (attributes) => {
    const path = attributes?.containerLabel['linto.api.gateway.service.endpoint']

    if (!path) throw new ServiceSettingsError()
  })
}
