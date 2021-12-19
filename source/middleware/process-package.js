const multer = require('multer')

const MAX_FILE_SIZE = 10 * 1024 * 1024

const processPackageBundle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
})

module.exports = processPackageBundle
