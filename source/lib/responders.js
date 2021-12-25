function createJSONResponder(res) {
  return function (status, payload) {
    res.setHeader('content-type', 'application/json')
    return res.status(status).json({ status, ...payload })
  }
}

module.exports = {
  createJSONResponder,
}
