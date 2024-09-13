const debug = require('debug')(`saas-api-gateway:lib:sqlite:index`)

const sqlite3 = require('sqlite3').verbose()
const { open } = require('sqlite')

const TYPE = require(`${process.cwd()}/components/ApiWatcher/controllers/dao/type.js`)

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
        accoustic TEXT,
        model_quality TEXT,
        model_type TEXT,
        language TEXT
      )
    `

        try {
            await DatabaseService.db.exec(sql)
            console.log('Service table created or already exists.')
        } catch (err) {
            console.error('Error creating the Service table:', err.message)
        }
    }

    static async insertService(data) {
        try {

            if (!TYPE.checkValue(data.type)) {
                throw new Error(`Invalid service type: ${data.type}. Valid types are: ${Object.values(TYPE).join(', ')}`)
            }

            const insertSQL = `
    INSERT INTO Service (name, serviceName, host, healthcheck, label, type, accoustic, model_quality, model_type, language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

            const params = [
                data.name,
                data.serviceName,
                data.host,
                data.healthcheck,
                JSON.stringify(data.label),
                data.type,
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
            return await this.db.all(`SELECT * FROM Service`)
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
DatabaseService.init()
