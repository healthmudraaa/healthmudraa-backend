const express = require("express");
const {
  getUserDetails,
  signinUser,
  signupUser,
  updatePassword,
  forgotPassword,
  refreshUserToken,
  changePassword,
  updateUser,
} = require("../controllers/userController");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");

//getuserdetails
router.get("/getdetails", userAuth, getUserDetails);

// signin
router.post("/signin", signinUser);

//signup
router.post("/signup", signupUser);

// update password
router.post("/updatepassword", updatePassword);

// forgot password
router.post("/forgotpassword", forgotPassword);

// refresh password
router.post("/refreshtoken", refreshUserToken);

router.post("/updateuser", userAuth, updateUser);

//getuserdetails
router.get("/changepassword", userAuth, changePassword);

module.exports = router;
