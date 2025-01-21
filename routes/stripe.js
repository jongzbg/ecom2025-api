const express = require('express')
const { authCheck } = require('../middleware/authCheck')
const router = express.Router()

// Import Controller
const { payment } = require('../controllers/stripeContoller')

router.post('/user/create-payment-intent', authCheck, payment)



module.exports = router