const express = require("express");
const router = express.Router();
const {
  signinAdmin,
  signupAdmin,
  refreshAdminToken,
  updatePassword,
  forgotPassword,
  getAllDoctor,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  createDoctor,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
  createHospital,
  updateHospital,
  deleteHospital,
  createTreatment,
  updateTreatment,
  deleteTreatment,
} = require("../controllers/adminController");
const adminAuth = require("../middlewares/adminAuth");

// signin
router.post("/signin", signinAdmin);

//signup
router.post("/signup", signupAdmin);

// update password
router.post("/updatepassword", updatePassword);

// forgot password
router.post("/forgotpassword", forgotPassword);

// refresh password
router.post("/refreshtoken", refreshAdminToken);

// change password
// router.post("/changepassword", doctorAuth, changePassword);

//doctors

router.get("/doctors", adminAuth, getAllDoctor);

router.get("/doctor/:id", adminAuth, getDoctor);

router.patch("/doctor/:doctorid", adminAuth, updateDoctor);

router.delete("/doctor/:id", adminAuth, deleteDoctor);

router.post("/doctor", adminAuth, createDoctor);

//users

router.get("/users", adminAuth, getAllUsers);

router.get("/user/:id", adminAuth, getUser);

router.patch("/user/:userid", adminAuth, updateUser);

router.delete("/user/:id", adminAuth, deleteUser);

router.post("/user", adminAuth, createUser);

//hospital
router.patch("/hospital/:id", adminAuth, updateHospital);

router.delete("/hospital/:id", adminAuth, deleteHospital);

router.post("/hospital", adminAuth, createHospital);

//treatments

router.patch("/treatment/:id", adminAuth, updateTreatment);

router.delete("/treatment/:id", adminAuth, deleteTreatment);

router.post("/treatment", adminAuth, createTreatment);

module.exports = router;
