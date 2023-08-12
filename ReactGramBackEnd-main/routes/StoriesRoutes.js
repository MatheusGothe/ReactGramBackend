const express = require('express')
const router = express.Router()

// Controller
const {
  postStories,
  deleteStory,
  getUserStories,
  getAllStories
} = require("../controllers/StorieController");


// Middlewares
const { photoInsertValidation, photoUpdateValidation, commentValidation } = require('../middlewares/photoValidation')
const authGuard = require('../middlewares/authGuard')
const validate = require('../middlewares/handleValidation')
const {imageUpload, resizeAndCompressImage} = require('../middlewares/imagemUpload')

//Routes
router.post(
  "/create",
  authGuard,
  imageUpload.single("story"),
  resizeAndCompressImage,
  validate,
  postStories
);
router.delete('/delete/:id',authGuard,deleteStory)
router.get('/get/:id',authGuard,getUserStories)
router.get('/',authGuard,getAllStories)






module.exports = router
