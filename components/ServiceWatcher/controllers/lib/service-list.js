const debug = require('debug')('saas-api-gateway:components:service-watcher:controllers:lib:service-list')
const axios = require('axios')

const Docker = require('dockerode')
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

const SECURITY_LEVEL = require(`${process.cwd()}/lib/securityLevel.js`)

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
          security_level: service.label.security_level || SECURITY_LEVEL.DEFAULT,
          desc: service.label.desc,
          scope: service.label.scope,
          image: service.image,
          endpoints: [],
          sub_services: {
            diarization: [],
            punctuation: []
          }
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

        if (service.stack.image.includes('linto-transcription-service') ||
          service.stack.image.includes('linto-platform-transcription-service')
        ) {

          let serviceInspect // Depending of the loading of the service the service id is not always available
          if (service?.id) serviceInspect = await docker.getService(service.id).inspect()
          else {
            serviceInspect = await docker.getService(service.stack.name + '_' + service.serviceName).inspect()
            if (serviceInspect) this.servicesLoaded[runningService].id = serviceInspect.ID
          }

          if (serviceInspect) {
            if (serviceInspect?.Spec?.TaskTemplate?.ContainerSpec?.Env) {
              const dockerEnv = service.extractEnv(serviceInspect.Spec.TaskTemplate.ContainerSpec.Env, ['LANGUAGE', 'MODEL_QUALITY', 'ACCOUSTIC', 'MODEL_TYPE'])
              serviceData = { ...serviceData, ...dockerEnv }
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

            listServices.transcription.push(serviceData)
          }

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

