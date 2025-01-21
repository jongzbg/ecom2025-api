// import ...
const express = require('express')
const router = express.Router()
// import controller
const { register, login, currentUser } = require('../controllers/authController')
// import middleware
const { authCheck, adminCheck } = require('../middleware/authCheck')

// router.get('/register', (req, res) => {
//     // code
//     res.send('hello regisger')
// })
router.post('/register', register)
router.post('/login', login)
router.post('/current-user', authCheck, currentUser)
router.post('/current-admin', authCheck, adminCheck, currentUser)

module.exports = router