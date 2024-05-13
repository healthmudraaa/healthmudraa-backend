const express = require("express");
const {
  getDoctor,
  createDoctor,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  signinUser,
  signupUser,
  updatePassword,
  forgotPassword,
  refreshDoctorToken,
  getDoctorDetails,
  specilizedDoctors,
  changePassword,
  searchDoctors,
  getDoctorLeads,
} = require("../controllers/doctorController");
const router = express.Router();
const doctorAuth = require("../middlewares/doctorAuth");
router.get("/searchdoctor", searchDoctors);
router.get("/getdetails", doctorAuth, getDoctorDetails);
router.get("/leads", doctorAuth, getDoctorLeads);
// get request
router.get("/", getAllDoctors);

// get specific request
router.get("/:id", getDoctor);

// get specilized doctors
router.post("/specilizeddoctors", specilizedDoctors);

// update request
router.patch("/updatedoctor", doctorAuth, updateDoctor);

// delete request
router.delete("/:id", doctorAuth, deleteDoctor);

// signin
router.post("/signin", signinUser);

//signup
router.post("/signup", signupUser);

// update password
router.post("/updatepassword", updatePassword);

// forgot password
router.post("/forgotpassword", forgotPassword);

// refresh password
router.post("/refreshtoken", refreshDoctorToken);

// change password
router.post("/changepassword", doctorAuth, changePassword);
module.exports = router;
