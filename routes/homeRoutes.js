const express = require("express");
const {
  homePage,
  servicesPage,
  videoPage,
} = require("../controllers/homeContorller");
const router = express.Router();

// get specific request
router.get("/", homePage);

router.get("/videos", videoPage);

router.get("/service", servicesPage);

module.exports = router;
