const multer = require('multer')
const path = require('path')
const messages = require('../lib/messages')

const MAX_FILE_SIZE = 10 * 1024 * 1024

//? We only allow tarballs (.tgz) files as packages
function fileFilter(req, file, callback) {
  const currentFileExt = path.extname(file.originalname)

  if (!['.tgz', '.json'].includes(currentFileExt)) {
    return callback(new Error(messages.PACKAGE_FILE_TYPE))
  }

  callback(null, true)
}

const processPackageBundle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).fields([
  { name: 'packageTarball', maxCount: 1 },
  { name: 'packageMeta', maxCount: 1 },
])

module.exports = processPackageBundle
