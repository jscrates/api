const db = require('../../../database')
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
    const packageFromDB = await db.packages.findFirst({ where: { name } })
    const _version = { version, tarball: publicURL }

    //? Package already has been published update it with the newer version.
    if (packageFromDB) {
      await db.packages.update({
        where: { id: packageFromDB.id },
        data: {
          author,
          versions: [...packageFromDB.versions, _version],
        },
      })

      return respond(200, {
        message: `The ${version} version of ${name} has been published.`,
      })
    }

    await db.packages.create({
      data: { name, author, dependencies, versions: [_version] },
    })

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
