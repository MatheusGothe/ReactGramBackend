const express = require('express')
const router = express()

router.use('/api/users', require('./UserRoutes'))
router.use('/api/photos',require('./PhotoRoutes'))
router.use('/api/stories',require('./StoriesRoutes'))
router.use('/api/home',require('./HomeRoutes.js'))


//test route
router.get('/', (req,res) => { 
    res.send('API WORKING') 
} )

module.exports = router