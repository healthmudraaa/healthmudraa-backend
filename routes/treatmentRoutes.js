const express = require("express");
const {
  getTreatment,
  createTreatment,
  getAllTreatment,
  updateTreatment,
  deleteTreatment,
} = require("../controllers/treatmentController");
const router = express.Router();
const doctorAuth = require("../middlewares/doctorAuth");

// get request
router.get("/", getAllTreatment);

// get specific request
router.get("/:id", getTreatment);

// post request
router.post("/", doctorAuth, createTreatment);

// update request
router.patch("/:id", doctorAuth, updateTreatment);

// delete request
router.delete("/:id", doctorAuth, deleteTreatment);

// get specific hospital in location

module.exports = router;
