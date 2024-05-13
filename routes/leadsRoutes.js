const express = require("express");
const { createLeads } = require("../controllers/leadsController");
const router = express.Router();
// get specilized doctors
router.post("/create-leads", createLeads);

module.exports = router;
