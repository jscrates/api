const { Router } = require('express')

const processPackage = require('../middleware/process-package')

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
packageRouter.post(
  '/publish/packed',
  processPackage.single('packageBundle'),
  require('../controllers/package/publish/packed')
)

module.exports = packageRouter
