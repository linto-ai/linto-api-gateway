/****************
***** Logs ******
*****************/

const ExceptionType = 'logs'

class LogsError extends Error {
  constructor(message) {
    super()
    this.name = 'LogsError'
    this.type = ExceptionType
    this.status = '500'
    if (message) this.message = message
    else this.message = 'Server error'
  }
}


module.exports = {
  LogsError,
}