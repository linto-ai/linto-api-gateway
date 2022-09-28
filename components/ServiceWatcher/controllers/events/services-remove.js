const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:events:service-remove')

const { ServiceSettingsError } = require(`${process.cwd()}/components/ServiceWatcher/error/service`)

module.exports = async function () {
  let webServer = this.app.components.WebServer

  this.on('service-remove', (attributes) => {
    const path = attributes?.containerLabel['linto.api.gateway.service.endpoint']

    if (!path) throw new ServiceSettingsError()

    // webServer.router.stack = webServer.router.stack.filter(layer => {
    //   debug(layer.regexp.toString().includes(path))
    //   return !layer.regexp.toString().includes(path)
    // })

  })
}
