/****************
***** Logs ******
*****************/

const ExceptionType = 'auths'

class AuthsError extends Error {
  constructor(message) {
    super()
    this.name = 'AuthsError'
    this.type = ExceptionType
    this.status = '500'
    if (message) this.message = message
    else this.message = 'Server error'
  }
}


module.exports = {
  AuthsError,
}