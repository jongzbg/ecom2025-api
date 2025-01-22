const express = require('express')
const router = express.Router()

// Controllers
const { create, list, read, update, remove, listby, searchFilters,createImages,removeImage } = require('../controllers/productController')
const { authCheck, adminCheck } = require('../middleware/authCheck')
// @ENDPONT http://localhost:5001/product
// router.get('/product', (req, res) => {
//     res.send('hello product')
// })
router.post('/product', create)
router.get('/products/:count', list)
router.get('/product/:id', read) // Similar like a END POINT list
router.put('/product/:id', update)  // Similar like a END POINT create
router.delete('/product/:id', remove)

router.post('/productby', listby)
router.post('/search/filters', searchFilters)

router.post('/images', authCheck, adminCheck, createImages)
router.post('/removeimages',authCheck, adminCheck, removeImage)

module.exports = router