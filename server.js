const express = require('express')
const Multer = require('multer')
const prisma = require('./source/database')

require('dotenv').config()

const PORT = process.env.PORT || 4000

const server = express()
const upload = Multer({
  storage: Multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'pkgs/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    },
  }),
})

const app = async function () {
  try {
    await prisma.$connect()

    server.use(express.json())
    server.use(express.urlencoded({ extended: false }))

    server.get('/', require('./source/controllers/welcome'))

    server.get(
      '/pkg/:package/:version?',
      require('./source/controllers/package/retrieve')
    )

    server.post(
      '/pkg/publish/tar',
      upload.single('package'),
      require('./source/controllers/package/publish')
    )

    server.post(
      '/pkg/publish/metadata',
      require('./source/controllers/package/publish')
    )

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
