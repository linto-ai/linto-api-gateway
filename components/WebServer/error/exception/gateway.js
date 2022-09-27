/****************
*****Metric******
*****************/

const ExceptionType = 'Gateway'

class GatewayMediaType extends Error {
  constructor(message) {
    super()
    this.name = 'GatewayMediaType'
    this.type = ExceptionType
    this.status = '415'
    if (message) this.message = message
    else this.message = 'Unsupported method'
  }
}

class GatewayError extends Error {
  constructor(message) {
    super()
    this.name = 'GatewayError'
    this.type = ExceptionType
    this.status = '500'
    if (message) this.message = message
    else this.message = 'Gateway api error'
  }
}


module.exports = {
  GatewayError,
}