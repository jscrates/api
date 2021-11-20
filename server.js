const express = require('express')
const { MongoClient } = require('mongodb')
require('dotenv').config()

const PORT = process.env.PORT || 4000
const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME
const COLLECTION_NAME = process.env.COLLECTION_NAME

const server = express()
const client = new MongoClient(MONGO_URL)

const app = async () => {
  try {
    const dbClient = await client.connect()
    const db = dbClient.db(DB_NAME).collection(COLLECTION_NAME)

    server.use(express.json())
    server.use(express.urlencoded({ extended: false }))

    server.get('/', (_, res) => {
      return res.status(200).json({ message: 'Welcome to JSCrates! 📦' })
    })

    server.get('/pkg/:package/:version?', async (req, res) => {
      const { package, version } = req.params

      if (version) {
        db.aggregate([
          {
            $match: {
              name: package,
            },
          },
          {
            $project: {
              name: '$name',
              version: {
                $filter: {
                  input: '$versions',
                  as: 'version',
                  cond: { $eq: ['$$version.version', version] },
                },
              },
            },
          },
        ]).toArray((err, result) => {
          if (err) {
            console.error(err)
            return res.status(500).json({ message: 'Something went wrong' })
          }

          const { _id, version, ...pkgMeta } = result[0]

          if (!version?.length) {
            return res.status(400).json({
              status: 400,
              message: `Error: Unable to find ${package} with the specified version`,
            })
          }

          return res.status(200).json({ ...pkgMeta, dist: version[0] })
        })
      } else {
        db.find({ name: package }).toArray((err, result) => {
          if (err) {
            console.error(err)
            return res.status(500).json({ message: 'Something went wrong' })
          }

          if (!result?.length) {
            return res.status(400).json({
              status: 400,
              message: `Error: Unable to find package ${package}`,
            })
          }

          const { _id, versions, ...pkgmeta } = result[0]
          return res.json({ ...pkgmeta, dist: versions[0] })
        })
      }
    })

    server.listen(PORT, () => {
      console.info(`Server listening for requests on port ${PORT}`)
    })
  } catch (err) {
    console.error(err)
  }
}

app().catch(console.dir)

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
