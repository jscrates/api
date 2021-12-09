const db = require('../database')

async function retrievePackage(req, res) {
  try {
    // Extract package name & version from Request's params
    const { package, version } = req.params

    // Query database for the specified package name
    const packageMeta = await db.packages.findFirst({
      where: {
        name: { equals: package },
      },
    })

    // If response ends up null, we don't have such package
    // in the repository
    if (!packageMeta) {
      return res.status(400).json({
        status: 400,
        message: `Error: Unable to find package ${package}`,
      })
    }

    // If version is provided, extract and send back that version
    if (version) {
      const selectedPackage = packageMeta.versions.filter(function (package) {
        return package?.version === version
      })

      // If provided version doesn't exist, send back error
      if (!selectedPackage?.length) {
        return res.status(400).json({
          status: 400,
          message: `Error: Unable to find ${package} with the specified version`,
        })
      }

      return res
        .status(200)
        .json({ name: packageMeta.name, dist: selectedPackage?.[0] })
    }

    return res
      .status(200)
      .json({ name: packageMeta.name, dist: packageMeta.versions?.[0] })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'internal server error' })
  }
}

module.exports = retrievePackage
