const express = require('express')
const router = express.Router()
const { create, list, remove } = require('../controllers/categoryController')
const { authCheck, adminCheck } = require('../middleware/authCheck')

// @ENDPOINT http://localhost:5001/category
// router.get('/category', (req, res) => {
//     res.send('hello category')
// })
router.post('/category', authCheck, adminCheck, create)
router.get('/category', list)
router.delete('/category/:id', authCheck, adminCheck, remove)

module.exports = router