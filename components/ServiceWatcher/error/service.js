/****************
***** Service ******
*****************/

const ExceptionType = 'service'

class ServiceApiEndpointError extends Error {
  constructor(endpoint) {
    super()
    this.name = 'ServiceApiEndpointError'
    this.type = ExceptionType
    this.status = '406'
    this.message = 'The requested endpoint is already used by an other service : '+endpoint
  }
}

class ServiceSettingsError extends Error {
  constructor() {
    super()
    this.name = 'ServiceSettingsError'
    this.type = ExceptionType
    this.status = '400'
    this.message = 'Require settings are missing'
  }
}

class ServiceError extends Error {
  constructor(message) {
    super()
    this.name = 'ServiceError'
    this.type = ExceptionType
    this.status = '500'
    if (message) this.message = message
    else this.message = 'Server error'
  }
}

module.exports = {
  ServiceApiEndpointError,
  ServiceSettingsError,
  ServiceError
}