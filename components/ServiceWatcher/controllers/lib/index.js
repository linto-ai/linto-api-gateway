const available = require(`${process.cwd()}/components/ServiceWatcher/controllers/lib/service-available`)
const discovery = require(`${process.cwd()}/components/ServiceWatcher/controllers/lib/service-discovery`)
const list = require(`${process.cwd()}/components/ServiceWatcher/controllers/lib/service-list`)


module.exports = {
  available : available,
  discovery : discovery,
  list : list
}