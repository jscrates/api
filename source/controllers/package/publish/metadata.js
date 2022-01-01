const Package = require('../../../models/packages')
const messages = require('../../../lib/messages')
const { createJSONResponder } = require('../../../lib/responders')

module.exports = async function processPackageMeta(req, res, next) {
  const respond = createJSONResponder(res)

  try {
    const { packageMeta, packageStatus } = res.locals
    const { name, version, dependencies, author } = packageMeta
    const { publicURL, isPublished } = packageStatus

    if (!isPublished) {
      return respond(500, { error: messages.SERVER_ERROR })
    }

    //? Check if package has already been published.
    const packageFromDB = await Package.findOne({ name })
    const _version = { version, tarball: publicURL }

    //? Package already has been published update it with the newer version.
    if (packageFromDB) {
      await Package.findByIdAndUpdate(packageFromDB._id, {
        latest: version,
        $push: {
          versions: _version,
        },
      })

      return respond(200, {
        message: `The ${version} version of ${name} has been published.`,
      })
    }

    const newPackage = new Package({
      name,
      author,
      dependencies,
      versions: [_version],
      latest: version,
    })

    await newPackage.save()

    return respond(200, { message: messages.PACKAGE_UPLOADED })
  } catch (error) {
    console.error(error)

    // There was an error while executing JSON.parse() on provided packageMeta file.
    if (error instanceof SyntaxError) {
      return respond(400, {
        error: messages.ERR_PKG_META_PARSING,
      })
    }

    return respond(500, {
      error: messages.SERVER_ERROR,
    })
  }
}
