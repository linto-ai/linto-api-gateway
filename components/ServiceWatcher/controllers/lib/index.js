const available = require(`${process.cwd()}/components/ServiceWatcher/controllers/lib/service-available`)
const discovery = require(`${process.cwd()}/components/ServiceWatcher/controllers/lib/service-discovery`)


module.exports = {
  available : available,
  discovery : discovery
}