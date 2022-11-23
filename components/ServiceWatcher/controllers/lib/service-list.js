const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:lib:service-list')
const axios = require('axios')

module.exports = async function serviceList(scope = undefined) {
  let listServices = {
    transcription: [],
    nlp: [],
    tts: [],
    services: []
  }

  if (Object.keys(this.servicesLoaded).length === 0) return listServices


  for (const runningService in this.servicesLoaded) {
    let service = this.servicesLoaded[runningService]

    if (service.isEnabled) {
      if (!scope || service.label.scope && service.label.scope.includes(scope)) {

        let serviceData = {
          name: service.name,
          serviceName: service.serviceName,
          desc: service.label.desc,
          scope: service.label.scope,
          image: service.image,
          endpoints: []
        }
        for (const endpoint in service.label.endpoints) {
          let endpointData = { endpoint: endpoint }

          if (service.label.endpoints[endpoint].middlewares.length > 0) {
            endpointData.middlewares = service.label.endpoints[endpoint].middlewares
            if (endpointData.middlewares.indexOf('billing') !== -1) {
              endpointData.billing = service.label.endpoints[endpoint].middlewareConfig.billing
            }
          }
          serviceData.endpoints.push(endpointData)
        }

        if (service.stack.image.includes('linto-platform-transcription-service')) {
          if (service.container.env) {
            serviceData.lang = service.container.env.LANGUAGE
            serviceData.model_quality = service.container.env.MODEL_QUALITY
            serviceData.accoustic = service.container.env.ACCOUSTIC
          }

          await axios.get(service.host + '/list-services').then(function (response) {
            serviceData.sub_services = response.data

          }).catch(function (error) {
            console.log(error)
          })

          listServices.transcription.push(serviceData)
        } else if (service.stack.image.includes('nlp')) {
          listServices.nlp.push(serviceData)
        } else if (service.stack.image.includes('tts')) {
          listServices.tts.push(serviceData)
        } else {
          listServices.services.push(serviceData)
        }
      }
    }
  }
  return listServices
}