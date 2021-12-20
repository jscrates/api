const db = require('../../../database')
const validateSchema = require('../../../lib/validations/package-meta')
const messages = require('../../../lib/messages')

module.exports = async function processPackageMeta(req, res) {
  try {
    const { files } = req

    // We do not have the package meta file,
    // probably the `package-meta.json`
    if (!files?.packageMeta?.length) {
      return res
        .status(400)
        .json({ status: 400, error: messages.MISSING_CREDENTIALS })
    }

    // Extract the raw packageMeta file sent by the client
    const packageMeta = files?.packageMeta[0]
    // Parse the meta into JSON for validation
    const jsonParsedMeta = JSON.parse(packageMeta?.buffer?.toString())

    // We got an invalid `package-meta.json`
    if (!(await validateSchema(jsonParsedMeta))) {
      return res.status(400).json({
        status: 400,
        error: messages.ERR_PKG_META_VALIDATION,
      })
    }

    const existingPackage = await db.packages.findFirst({
      where: {
        name: jsonParsedMeta?.name,
      },
    })

    // The package has never been published
    //* To be continued
    if (!existingPackage) {
    }

    const existingPackageVersions = existingPackage.versions.map(
      (v) => v?.version
    )

    if (existingPackageVersions.includes(jsonParsedMeta?.version)) {
      return res.status(400).json({
        status: 400,
        error: `The package \`${jsonParsedMeta?.name}\` with version \`${jsonParsedMeta?.version}\` has already been published.`,
      })
    }

    console.log(existingPackage, existingPackageVersions)

    return res.status(200).json({ message: `Package published!` })
  } catch (error) {
    console.error(error)

    // There was an error with the JSON.parse()
    // on the packageMeta file provided.
    if (error instanceof SyntaxError) {
      return res.status(400).json({
        status: 400,
        error: messages.ERR_PKG_META_PARSING,
      })
    }

    return res.status(500).json({
      status: 500,
      error: messages.SERVER_ERROR,
    })
  }
}
