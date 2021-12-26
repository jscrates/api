const dotenv = require('dotenv')

if ('production' !== process.env.NODE_ENV) {
  dotenv.config()
}

class ApplicationConfig {
  static _read = function (key) {
    const value = process.env[key]
    if (!value) {
      throw Error(`Unable to read the environment variable ${key}.`)
    }
    return value
  }

  static PORT = parseInt(ApplicationConfig._read('PORT'))
  static DATABASE_URL = ApplicationConfig._read('DATABASE_URL')
  static AUTH_API = ApplicationConfig._read('AUTH_API')
  static GC_BUCKET_NAME = ApplicationConfig._read('GC_BUCKET_NAME')
  static GC_PROJECT_ID = ApplicationConfig._read('GC_PROJECT_ID')
  static GC_CLIENT_EMAIL = ApplicationConfig._read('GC_CLIENT_EMAIL')
  static GC_PRIVATE_KEY = ApplicationConfig._read('GC_PRIVATE_KEY')
  static JSON_SCHEMA_URL = ApplicationConfig._read('JSON_SCHEMA_URL')
}

module.exports = ApplicationConfig
