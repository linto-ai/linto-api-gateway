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
		process.env.EXPRESS_SIZE_FILE_MAX = ifHas(process.env.EXPRESS_SIZE_FILE_MAX, envdefault.EXPRESS_SIZE_FILE_MAX)

		process.env.SQLITE_DB_MODE = ifHas(process.env.SQLITE_DB_MODE, envdefault.SQLITE_DB_MODE)
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
module.exports = configureDefaults()