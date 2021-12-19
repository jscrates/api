const messages = require('../lib/messages')

module.exports = function notFoundController(req, res) {
  return res.status(404).json({ status: 404, error: messages.NOT_FOUND })
}
