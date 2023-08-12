const express = require('express')
const router = express.Router()

// Controller
const {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  removeLike,
  likePhoto,
  commentPhoto,
  removeCommentPhoto,
  searchPhotos,
  getPhotoLikes,
} = require("../controllers/PhotoController");



// Middlewares
const { photoInsertValidation, photoUpdateValidation, commentValidation } = require('../middlewares/photoValidation')
const authGuard = require('../middlewares/authGuard')
const validate = require('../middlewares/handleValidation')
const {imageUpload, resizeAndCompressImage} = require('../middlewares/imagemUpload')

//Routes
router.post(
  "/",
  authGuard,
  imageUpload.single("image"),
  resizeAndCompressImage,
  photoInsertValidation(),
  validate,
  insertPhoto
);  
router.delete('/:id', authGuard, deletePhoto)
router.get('/',authGuard, getAllPhotos)
router.get('/user/:id', authGuard, getUserPhotos)
router.get('/search', authGuard, searchPhotos)
router.get("/:id", authGuard, getPhotoById)
router.put('/:id', authGuard,photoUpdateValidation(),validate ,updatePhoto)
router.delete('/deslike/:id', authGuard, removeLike)
router.put('/like/:id',authGuard, likePhoto)
router.put(
  "/comment/:id",
  authGuard,
  commentValidation(),
  validate,
  commentPhoto
)
router.delete("/remove/:id/:commentId",authGuard, removeCommentPhoto); 
router.get('/likes/:photoId',authGuard,getPhotoLikes)





module.exports = router
