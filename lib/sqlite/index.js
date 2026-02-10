const debug = require('debug')(`saas-api-gateway:lib:sqlite:index`)

const sqlite3 = require('sqlite3').verbose()
const { open } = require('sqlite')

const TYPE = require(`${process.cwd()}/components/ApiWatcher/controllers/dao/type.js`)
const SECURITY_LEVEL = require(`${process.cwd()}/lib/securityLevel.js`)

class DatabaseService {
    static db
    static instance = null
    constructor() {
        if (DatabaseService.instance) {
            return DatabaseService.instance
        }
        DatabaseService.instance = this
    }

    static async getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService()
        }
        return DatabaseService.instance
    }

    // Initialize and connect to the database asynchronously
    static async init() {
        try {
            let dbMode = `${process.cwd()}/database/resultDB.sqlite`
            if (process.env.SQLITE_DB_MODE === ':memory:')
                dbPath = ':memory:'

            DatabaseService.db = await open({
                filename: dbMode,   // DB mode
                driver: sqlite3.Database
            })
            console.log('Connected to the database.')
            await DatabaseService.createServiceTable()  // Ensure the table is created
        } catch (err) {
            console.error('Error connecting to the database:', err.message)
        }
    }

    // Create the Service table
    static async createServiceTable() {
        const sql = `
      CREATE TABLE IF NOT EXISTS Service (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        serviceName TEXT NOT NULL UNIQUE,
        host TEXT NOT NULL,
        healthcheck TEXT NOT NULL,
        label TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('transcription', 'nlp', 'tts', 'services')),
        security_level INTEGER DEFAULT 0 CHECK (security_level >= 0 AND security_level <= 3),
        accoustic TEXT,
        model_quality TEXT,
        model_type TEXT,
        language TEXT
      )
    `

        try {
            await DatabaseService.db.exec(sql)
            console.log('Service table created or already exists.')

            // Add security_level column if it doesn't exist (for existing databases)
            await DatabaseService.addSecurityLevelColumn()
        } catch (err) {
            console.error('Error creating the Service table:', err.message)
        }
    }

    // Add security_level column to existing databases (migration)
    static async addSecurityLevelColumn() {
        try {
            const tableInfo = await DatabaseService.db.all(`PRAGMA table_info(Service)`)
            const hasSecurityLevel = tableInfo.some(col => col.name === 'security_level')

            if (!hasSecurityLevel) {
                await DatabaseService.db.exec(`ALTER TABLE Service ADD COLUMN security_level INTEGER DEFAULT 0`)
                console.log('Added security_level column to Service table.')
            }
        } catch (err) {
            // Column might already exist or other error, log but continue
            debug('Note: security_level column migration:', err.message)
        }
    }

    static validateSecurityLevel(level) {
        return SECURITY_LEVEL.validate(level)
    }

    static async insertService(data) {
        try {

            if (!TYPE.checkValue(data.type)) {
                throw new Error(`Invalid service type: ${data.type}. Valid types are: ${Object.values(TYPE).join(', ')}`)
            }

            const securityLevel = DatabaseService.validateSecurityLevel(data.security_level)

            const insertSQL = `
    INSERT INTO Service (name, serviceName, host, healthcheck, label, type, security_level, accoustic, model_quality, model_type, language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

            const params = [
                data.name,
                data.serviceName,
                data.host,
                data.healthcheck,
                JSON.stringify(data.label),
                data.type,
                securityLevel,
                data.accoustic || null,
                data.model_quality || null,
                data.model_type || null,
                data.language || null
            ]

            await this.db.run(insertSQL, params)
        } catch (err) {
            console.error('Error inserting data into Service table:', err.message)
        }
    }

    static async getAllServices() {
        try {
            const services = await this.db.all(`SELECT * FROM Service`)
            return services.map(service => {
                // Ensure security_level is an integer with default value
                service.security_level = SECURITY_LEVEL.validate(service.security_level)
                if (service.type !== "TRANSCRIPTION") { // Remove specific keys if they exist and are null
                    ["accoustic", "model_quality", "model_type", "language"].forEach(key => {
                        if (service[key] === null) {
                            delete service[key];
                        }
                    });
                }
                return service
            })
        } catch (err) {
            console.error('Error fetching all services:', err.message)
            throw err
        }
    }
    static async getServiceByServiceName(serviceName) {
        try {
            return await this.db.get(`SELECT * FROM Service WHERE serviceName = ?`, [serviceName])
        } catch (err) {
            console.error(`Error fetching service with serviceName ${serviceName}:`, err.message)
            throw err
        }
    }

    static async getServiceByAvailableEndpoint(endpoint) {
        try {
            const sql = `SELECT * FROM Service WHERE json_extract(label, '$.endpoints."${endpoint}"') IS NOT NULL`
            const result = await this.db.all(sql)
            return result
        } catch (err) {
            console.error('Error deleting service:', err.message)
            throw err
        }
    }

    static async deleteServices(serviceName) {
        try {
            const sql = `DELETE FROM Service WHERE serviceName = ?`
            const result = await this.db.run(sql, [serviceName])

            if (result.changes === 0) return false
            else return true
        } catch (err) {
            console.error('Error deleting service:', err.message)
            throw err
        }
    }
}

module.exports = DatabaseService
