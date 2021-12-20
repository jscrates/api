const { Router } = require('express')

const processPackage = require('../middleware/process-package')
const processPackageMeta = require('../controllers/package/publish/metadata')

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
  processPackage,
  processPackageMeta,
  require('../controllers/package/publish/packed')
)

module.exports = packageRouter
