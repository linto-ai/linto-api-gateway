/****************
***** Logs ******
*****************/

const ExceptionType = 'service'

class ServiceSettingsError extends Error {
  constructor(message) {
    super()
    this.name = 'ServiceSettingsError'
    this.type = ExceptionType
    this.status = '400'
    if (message) this.message = message
    else this.message = 'Unable to setup service'
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
  ServiceSettingsError,
  ServiceError
}