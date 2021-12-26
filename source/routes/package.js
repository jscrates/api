const { Router } = require('express')
const retrievePackage = require('../controllers/package/retrieve')
const processPackage = require('../middleware/process-package')
const processPackageMeta = require('../middleware/process-package-meta')
const uploadPackageTarball = require('../controllers/package/publish/packed')
const publishPackageMeta = require('../controllers/package/publish/metadata')

const packageRouter = Router()

//? Retrieve package metadata from the repository.
packageRouter.get('/:package/:version?', retrievePackage)

//? Publish provided package to the repository
// TODO: Add auth middleware
packageRouter.post(
  '/publish',
  processPackage,
  processPackageMeta,
  uploadPackageTarball,
  publishPackageMeta
)

module.exports = packageRouter
