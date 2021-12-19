const axios = require('axios').default
const { isAxiosError } = require('axios').default

module.exports = async function loginController(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        error: '`username` & `password` are required to proceed.',
      })
    }

    await axios.post(`${process.env.AUTH_API}/register`, {
      username: email,
      password,
    })

    return res.status(200).json({
      status: 200,
      message:
        'Registration successful. Please login to start publishing your own packages.',
    })
  } catch (err) {
    if (isAxiosError(err)) {
      console.log(err.response.data)

      const { status, error } = err.response.data
      return res.status(status).json({ status, error: error?.message || error })
    }

    return res.status(500).json({
      status: 500,
      error: 'Oops! Something went wrong. We are investigating the issue.',
    })
  }
}
