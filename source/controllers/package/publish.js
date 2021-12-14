function publishPackage(req, res) {
  console.log(req.file)
  return res.status(200).json({ message: `Package published!` })
}

module.exports = publishPackage
