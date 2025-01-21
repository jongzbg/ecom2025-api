const express = require('express')
const { authCheck } = require('../middleware/authCheck')
const router = express.Router()
const {getOrderAdmin,chageOrderStatus } = require('../controllers/adminController')

router.put('/admin/order-status',authCheck,chageOrderStatus)
router.get('/admin/orders',authCheck,getOrderAdmin)


module.exports = router