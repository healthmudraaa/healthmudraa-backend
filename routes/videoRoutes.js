const express = require("express");

const {
  getVideo,
  createVideo,
  getAllVideos,
  updateVideo,
  deleteVideo,
  getVideoByDoctor,
} = require("../controllers/videoController");
const doctorAuth = require("../middlewares/doctorAuth");

const router = express.Router();

router.get("/", getAllVideos);
router.get("/:id", getVideo);
router.patch("/:id", doctorAuth, updateVideo);
router.delete("/:id", doctorAuth, deleteVideo);
router.post("/", doctorAuth, createVideo);
router.get("/doctor/:id", getVideoByDoctor);

module.exports = router;
