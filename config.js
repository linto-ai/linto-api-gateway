const debug = require('debug')('saas-api-gateway:config')
const dotenv = require('dotenv')
const fs = require('fs')

function ifHasNotThrow(element, error) {
    if (!element) throw error
    return element
}

function ifHas(element, defaultValue) {
    if (!element) return defaultValue
    return element
}

function configureDefaults() {
	try {
		const envdefault = dotenv.parse(fs.readFileSync('.envdefault'))

		process.env.SAAS_API_GATEWAY_HTTP_PORT = ifHas(process.env.SAAS_API_GATEWAY_HTTP_PORT, envdefault.SAAS_API_GATEWAY_HTTP_PORT)
		process.env.COMPONENTS = ifHas(process.env.COMPONENTS, envdefault.COMPONENTS)



		process.env.DB_HOST = ifHas(process.env.DB_HOST, envdefault.DB_HOST)
		process.env.DB_USER = ifHas(process.env.DB_USER, envdefault.DB_USER)
		process.env.DB_PASS = ifHas(process.env.DB_PASS, envdefault.DB_PASS)
		process.env.DB_PORT = ifHas(process.env.DB_PORT, envdefault.DB_PORT)
		process.env.DB_NAME = ifHas(process.env.DB_NAME, envdefault.DB_NAME)
		process.env.DB_REQUIRE_LOGIN = ifHas(process.env.DB_REQUIRE_LOGIN, envdefault.DB_REQUIRE_LOGIN)


	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
module.exports = configureDefaults()