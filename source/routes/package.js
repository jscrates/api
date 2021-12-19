const { Router } = require('express')

const packageRouter = Router()

/**
 * Retrieve package metadata from the repository.
 */
packageRouter.get(
  '/:package/:version?',
  require('../controllers/package/retrieve')
)

/**
 * TODO
 * Publishes package metadata to the database.
 */
// server.post(
//   '/pkg/publish/metadata',
//   require('./source/controllers/package/publish/metadata')
// )

/**
 * TODO
 * Publishes bundled package to the repository.
 */
// server.post(
//   '/pkg/publish/tar',
//   upload.single('package'),
//   require('./source/controllers/package/publish/tar')
// )

module.exports = packageRouter
