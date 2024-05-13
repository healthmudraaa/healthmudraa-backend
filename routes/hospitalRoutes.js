const express = require("express");
const {
  getAllHospital,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital,
  getHospitalByLocation,
} = require("../controllers/hospitalController");
const router = express.Router();
const doctorAuth = require("../middlewares/doctorAuth");

router.get("/location/:latitude&:longitude", getHospitalByLocation);
// get request
router.get("/", getAllHospital);

// get specific request
router.get("/:id", getHospital);

// post request
router.post("/", doctorAuth, createHospital);

// update request
router.patch("/:id", doctorAuth, updateHospital);

// delete request
router.delete("/:id", doctorAuth, deleteHospital);

// get specific hospital in location

module.exports = router;
