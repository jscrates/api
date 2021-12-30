const mongoose = require('mongoose')
const ApplicationConfig = require('./lib/config')

class Database {
  connect = async () => {
    try {
      await mongoose.connect(ApplicationConfig.DATABASE_URL)
      console.info('DB: Established connection to database.')
    } catch (error) {
      console.error(
        'DB: There was a problem connecting with the database.',
        error
      )
      return process.exit(1)
    }
  }

  disconnect = async () => {
    try {
      await mongoose.disconnect()
    } catch (error) {}
  }
}

module.exports = Database
