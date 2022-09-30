/****************
***** Logs ******
*****************/

const ExceptionType = 'service'

class ServiceApiEndpointError extends Error {
  constructor(endpoint) {
    super()
    this.name = 'ServiceApiEndpointError'
    this.type = ExceptionType
    this.status = '400'
    this.message = 'An endpoint is already used by an other service '+endpoint
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
  ServiceError
}