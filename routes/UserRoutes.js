const express = require("express");
const router = express.Router();

// Controller
const {
  register,
  login,
  getCurrentUser,
  update,
  getUserById,
  forgotPassword,
  followUser,
  unFollowUser,
  getUserFollowing,
  getUserFollowers,
  searchUsers
} = require("../controllers/UserController");

// Middlwares
const validate = require("../middlewares/handleValidation");
const {
  userCreateValidation,
  loginValidation,
  userUpdateValidation,
} = require("../middlewares/userValidation");
const authGuard = require("../middlewares/authGuard");
const { imageUpload } = require("../middlewares/imagemUpload");

// Routes
router.post("/register", userCreateValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);
router.get("/profile", authGuard, getCurrentUser);
router.get('/search', authGuard, searchUsers)
router.put(
  "/",
  authGuard,
  userUpdateValidation(),
  validate,
  imageUpload.single("profileImage"),
  update
);
router.put('/reset-password', forgotPassword)
router.get('/:id',getUserById)
router.post('/follow/:userId',authGuard,followUser)
router.delete('/unfollow/:userId', authGuard, unFollowUser)
router.get('/following/:userId', authGuard,getUserFollowing)
router.get('/followers/:userId', authGuard,getUserFollowers)


module.exports = router;
