/****************
*** Billing *****
*****************/

const ExceptionType = 'billing'

class BillingError extends Error {
  constructor(message) {
    super()
    this.name = 'BillingError'
    this.type = ExceptionType
    this.status = '500'
    if (message) this.message = message
    else this.message = 'Server error'
  }
}


module.exports = {
  BillingError,
}