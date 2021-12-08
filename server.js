const express = require('express')
const prisma = require('./source/database')
const retrievePackage = require('./source/controllers/retrieve-package')

require('dotenv').config()

const PORT = process.env.PORT || 4000

const server = express()

const app = async function () {
  try {
    await prisma.$connect()

    server.use(express.json())
    server.use(express.urlencoded({ extended: false }))

    server.get('/', function (_, res) {
      return res.status(200).json({ message: 'Welcome to JSCrates! 📦' })
    })

    server.get('/pkg/:package/:version?', retrievePackage)

    // handle endpoint-not-found endpoints
    server.use('*', (_, res) => {
      res
        .status(404)
        .json({ error: 'You have reached the end of crates bunker!' })
    })

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
    await prisma.$disconnect()
  })

// Close the database connection after process exits.
// https://stackoverflow.com/a/62294908/7469926

// const cleanUp = (eventType) => {
//   client.close(() => {
//     console.info('Database connection closed!')
//   })
// }

// ;[
//   `exit`,
//   `SIGINT`,
//   `SIGUSR1`,
//   `SIGUSR2`,
//   `uncaughtException`,
//   `SIGTERM`,
// ].forEach((eventType) => {
//   process.on(eventType, cleanUp.bind(null, eventType))
// })
