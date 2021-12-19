const { Router } = require('express')

const loginController = require('../controllers/auth/login')
const registerController = require('../controllers/auth/register')

const authRouter = Router()

authRouter.put('/login', loginController)
authRouter.post('/register', registerController)

module.exports = authRouter
