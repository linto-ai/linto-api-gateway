const debug = require('debug')('saas-api-gateway:components:api-watcher:controllers:lib:api-list')
const axios = require('axios')

module.exports = async function serviceList(scope = undefined) {
  let services = Object.assign({}, this.servicesLoaded)
  services.transcription = await generateTranscriptionService(this.servicesLoaded.transcription)

  if (scope) {
    for (const [serviceType, serviceList] of Object.entries(services)) {
      services[serviceType] = serviceList.filter(service => service.scope && service.scope.includes(scope))
    }
  }
  return services
}

async function generateTranscriptionService(transcription) {
  let transcriptionService = []
  for (let service of transcription) {
    if (service.label.enabled) {
      let serviceData = {
        name: service.name,
        serviceName: service.serviceName,
        desc: service.label.desc,
        scope: service.label.scope || ["cm", "api", "stt"],
        image: service.image,
        endpoints: [],
        sub_services: {
          diarization: [],
          punctuation: []
        },
        accoustic: service.accoustic || "",
        language: service.language || "",
        model_quality: service.model_quality || "",
        model_type: service.model_type || ""
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

      await axios.get(service.host + '/list-services').then(function (response) {
        if (response.data.diarization.length > 0) {
          for (let diarization of response.data.diarization) {
            try {
              if (diarization.info) diarization.info = JSON.parse(diarization.info)
            } catch (err) { }
            serviceData.sub_services.diarization.push(diarization)
          }
        }
        if (response.data.punctuation.length > 0) {
          for (let punctuation of response.data.punctuation) {
            try {
              if (punctuation.info) punctuation.info = JSON.parse(punctuation.info)
            } catch (err) { }
            serviceData.sub_services.punctuation.push(punctuation)
          }
        }


      }).catch(function (error) {
        console.log(error)
      })

      transcriptionService.push(serviceData)
    }
  }
  return transcriptionService
}