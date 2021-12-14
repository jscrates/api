const joi = require('joi')

function publishPackageMetadata(req, res) {
  const { package_name, version, schema } = req.body

  // Validate the package metdata here
  const mdata = joi.object({
    package_name: joi.string(),
    version: joi.number(),
    schema: joi.string().uri(),
  })
  const { error } = mdata.validate({ package_name, version, schema })

  // if validation fails,
  if (error) {
    switch (error.detas[0].context.key) {
      case 'package':
        res.status(200).json({ message: error.details[0].message })
        break
      case 'version':
        res.status(200).json({ message: error.details[0].message })
        break
      case 'schema':
        res.status(200).json({ message: error.details[0].message })
        break
      default:
        res.status(200).json({ message: 'Invalid metadata!' })
        break
    }
  }
  // return res.status(400).json({ message: `Invalid metadata!` })
  return res.status(200).json({ message: `Package published!` })
}

module.exports = publishPackageMetadata
