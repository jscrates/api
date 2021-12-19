const express = require('express')
// Database
const database = require('./source/database')
// Routers
const authRouter = require('./source/routes/auth')
const packageRouter = require('./source/routes/package')
// Controllers
const notFoundController = require('./source/controllers/not-found')

require('dotenv').config()

const PORT = process.env.PORT || 4000
const server = express()

const app = async function () {
  try {
    await database.$connect()

    // Middleware
    server.use(express.json())
    server.use(express.urlencoded({ extended: false }))

    // Routes
    server.use('/auth', authRouter)
    server.use('/pkg', packageRouter)
    server.use('*', notFoundController)

    // Start listening to requests
    server.listen(PORT, function () {
      console.info(`Server listening for requests on port ${PORT}`)
    })
  } catch (err) {
    console.error(err)
  }
}

app()
  .catch(console.dir)
  .finally(async function () {
    await database.$disconnect()
  })
