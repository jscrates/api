function publishPackageMetadata(req, res) {
  const { metadata } = req.body

  // Validate the package metdata here
  // if validation fails,
  // return res.status(400).json({ message: `Invalid metadata!` })

  return res.status(200).json({ message: `Package published!` })
}

module.exports = publishPackageMetadata
//all