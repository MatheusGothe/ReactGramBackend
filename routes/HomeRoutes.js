const express = require('express')
const router = express.Router()

// Midlewares
const authGuard = require('../middlewares/authGuard')
const { LoadHome } = require('../controllers/HomeController')


//Routes
router.get('/',authGuard,LoadHome)  


module.exports = router