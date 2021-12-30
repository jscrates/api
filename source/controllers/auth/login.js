const axios = require('axios').default
const { isAxiosError } = require('axios').default
const messages = require('../../lib/messages')
const ApplicationConfig = require('../../lib/config')

module.exports = async function loginController(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        error: messages.MISSING_CREDENTIALS,
      })
    }

    const { data: login } = await axios.put(
      `${ApplicationConfig.AUTH_API}/login`,
      {
        username: email,
        password,
      }
    )

    const { token } = login?.data

    return res
      .status(200)
      .json({ status: 200, message: messages.LOGIN_DONE, data: { token } })
  } catch (err) {
    if (isAxiosError(err)) {
      const { status, error } = err.response.data
      return res.status(status).json({ status, error: error?.message || error })
    }

    return res.status(500).json({
      status: 500,
      error: messages.SERVER_ERROR,
    })
  }
}
