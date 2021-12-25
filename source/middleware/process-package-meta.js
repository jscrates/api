const db = require('../database')
const messages = require('../lib/messages')
const { createJSONResponder } = require('../lib/responders')
const validateSchema = require('../lib/validations/package-meta')

module.exports = async function processPackageMeta(req, res, next) {
  const respond = createJSONResponder(res)

  try {
    const { files } = req

    //? We do not have the package meta & tarball to proceed.
    //? This prevents a (unnecessary) trip to the database.
    if (!files?.packageMeta?.length || !files.packageTarball?.length) {
      return respond(400, { error: messages.MISSING_CREDENTIALS })
    }

    // Extract the raw packageMeta file sent by the client
    const packageMeta = files?.packageMeta[0]
    // Parse the meta into JSON for validation
    const jsonParsedMeta = JSON.parse(packageMeta?.buffer?.toString())

    res.locals.packageMeta = jsonParsedMeta

    // We got an invalid `package-meta.json`
    if (!(await validateSchema(jsonParsedMeta))) {
      return respond(400, {
        error: messages.ERR_PKG_META_VALIDATION,
      })
    }

    const existingPackage = await db.packages.findFirst({
      where: {
        name: jsonParsedMeta?.name,
      },
    })

    //? The package has never been published, we can safely proceed to
    //? upload process & then publish it.
    if (!existingPackage) {
      return next()
    }

    // We currently do not allow publishing a package version
    // that has already been published but we might need to dig deep
    // on whether we should enable this.
    // TODO: Perform version checking using database queries (probably using aggregation?).
    const existingPackageVersions = existingPackage.versions.map(
      (v) => v?.version
    )

    if (existingPackageVersions.includes(jsonParsedMeta?.version)) {
      return respond(400, {
        error: `The package \`${jsonParsedMeta?.name}\` with version \`${jsonParsedMeta?.version}\` has already been published.`,
      })
    }

    return next()
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
