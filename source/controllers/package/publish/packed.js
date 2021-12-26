const { Storage } = require('@google-cloud/storage')
const messages = require('../../../lib/messages')
const { createJSONResponder } = require('../../../lib/responders')
const ApplicationConfig = require('../../../lib/config')

const GC_BUCKET_NAME = ApplicationConfig.GC_BUCKET_NAME
const GC_DIR_PREFIX_DEV = `dev/pkgs`
const GC_DIR_PREFIX_PROD = `pkgs`

// Very naive way of obtaining credentials from environment.
//? Explore "Identity Federation".
// TODO: Find a better alternative.
const storage = new Storage({
  projectId: ApplicationConfig.GC_PROJECT_ID,
  credentials: {
    client_email: ApplicationConfig.GC_CLIENT_EMAIL,
    private_key: ApplicationConfig.GC_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
}).bucket(GC_BUCKET_NAME)

module.exports = async function publishPackage(req, res, next) {
  const respond = createJSONResponder(res)

  try {
    const { env } = req.app.locals.settings
    const { packageMeta = {} } = res.locals
    const { files } = req

    const IS_DEV = env === 'development'

    if (!files?.packageTarball) {
      return respond(400, { error: messages.MISSING_CREDENTIALS })
    }

    const packageBundle = files?.packageTarball[0]
    const packagePathPrefix = IS_DEV ? GC_DIR_PREFIX_DEV : GC_DIR_PREFIX_PROD

    //? The full path of where the package shall be in the repository
    const packageFullPathInBucket = `${packagePathPrefix}/${packageMeta?.name}/${packageBundle?.originalname}`

    //? Initialize the package for upload
    const blob = storage.file(packageFullPathInBucket)

    //? The public URL from which the package is exposed to the public
    const publicPackageURL = `https://storage.googleapis.com/${GC_BUCKET_NAME}/${blob?.name}`

    //? An extra step to prevent uploading the same package multiple times
    //? We get the boolean in an array and hence [0] notation to access it.
    //? https://googleapis.dev/nodejs/storage/latest/File.html#exists-examples
    // TODO: Configure object versioning on the repository to handle this.
    if (!IS_DEV && (await blob.exists())[0]) {
      return respond(200, {
        message: messages.PACKAGE_UPLOADED,
        data: { publicPackageURL },
      })
    }

    //? Initiate the package upload process.
    const blobStream = blob.createWriteStream({
      resumable: false,
    })

    //? File upload has errored out.
    blobStream.on('error', function (err) {
      console.error(err)
      return respond(500, { error: messages.SERVER_ERROR })
    })

    //? File has finished uploading.
    blobStream.on('finish', function () {
      res.locals.packageStatus = {
        publicURL: publicPackageURL,
        isPublished: true,
      }

      return next()
      // return respond(200, {
      //   message: messages.PACKAGE_UPLOADED,
      //   data: {
      //     publicPackageURL,
      //   },
      // })
    })

    //? End the stream by writing the file buffer on the repository.
    //? This is required to flush the package metadata to disk.
    blobStream.end(packageBundle?.buffer)
  } catch (err) {
    console.error(err)

    if (err?.code === 'LIMIT_FILE_SIZE') {
      return respond(400, {
        error: messages.PACKAGE_SIZE_EXCEEDED,
      })
    }

    return respond(500, {
      error: messages.SERVER_ERROR,
    })
  }
}
