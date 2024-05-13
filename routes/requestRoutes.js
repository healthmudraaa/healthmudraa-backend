const express = require("express");
const {
  createRequest,
  getRequests,
  getSentRequests,
  updateRequest,
  searchHospitals,
} = require("../controllers/requestController");
const router = express.Router();
const doctorAuth = require("../middlewares/doctorAuth");

// post request
router.post("/", doctorAuth, createRequest);

// get requests
router.get("/", doctorAuth, getRequests);

// get sent requests
router.get("/sentrequest", doctorAuth, getSentRequests);

// update request
router.patch("/:id", doctorAuth, updateRequest);

// get specific hospital in location

router.get("/searchhospitals", searchHospitals);

module.exports = router;
