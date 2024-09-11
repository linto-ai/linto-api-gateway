const debug = require('debug')('saas-api-gateway:components:webserver:controllers:eventsFrom:ServiceWatcher:api-create');
const { createRoute } = require(`${process.cwd()}/components/WebServer/controllers/lib/`);

let isRegistered = false

module.exports = async function () {
  if (isRegistered) return

  if (!this.app.components['ApiWatcher']) return
  this.app.components['ApiWatcher'].on('api-create', async (type, serviceToStart) => {
    this.app.components['ApiWatcher'].servicesLoaded[type].push(serviceToStart)
    createRoute.call(this, serviceToStart)
  })

  isRegistered = true
}
