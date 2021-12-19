const { Storage } = require('@google-cloud/storage')

const messages = require('../../../lib/messages')

// Very naive way of obtaining credentials from environment.
//? Explore "Identity Federation".
// TODO: Find a better alternative.
const storage = new Storage({
  projectId: process.env.GC_PROJECT_ID,
  credentials: {
    client_email: process.env.GC_CLIENT_EMAIL,
    private_key: process.env.GC_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
}).bucket(process.env.GC_BUCKET_NAME)

module.exports = async function publishPackage(req, res) {
  try {
    const { file: packageBundle } = req

    if (!packageBundle) {
      return res
        .status(400)
        .json({ status: 400, error: messages.MISSING_CREDENTIALS })
    }

    const blob = storage.file(`dev/${packageBundle?.originalname}`)
    const blobStream = blob.createWriteStream({
      resumable: false,
    })

    // File upload has errored out
    blobStream.on('error', function (err) {
      console.error(err)
      return res.status(500).json({ status: 500, error: messages.SERVER_ERROR })
    })

    // File has finished uploading
    blobStream.on('finish', function () {
      return res
        .status(200)
        .json({ status: 200, message: messages.PACKAGE_UPLOADED })
    })

    // End the stream by writing the file buffer
    blobStream.end(packageBundle?.buffer)
  } catch (err) {
    console.error(err)

    if (err?.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 400,
        error: messages.PACKAGE_SIZE_EXCEEDED,
      })
    }

    return res.status(500).json({
      status: 500,
      message: messages.SERVER_ERROR,
    })
  }
}
