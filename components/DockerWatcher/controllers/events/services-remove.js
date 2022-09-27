const debug = require('debug')('saas-api-gateway:lib:dockerwebserver:events:services')

const middlewares = require(`${process.cwd()}/components/WebServer/middlewares`)
const { ServiceSettingsError, ServiceError } = require(`${process.cwd()}/components/DockerWatcher/error/service`)

module.exports = async function () {
  let webServer = this.app.components.WebServer
  let router = undefined

  this.on('service-remove', (attributes) => {
    const path = attributes?.containerLabel['linto.api.gateway.endpoint']

    if (!path) throw new ServiceSettingsError()

    //TODO: WIP

  })
}
