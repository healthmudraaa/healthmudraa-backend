const express = require("express");
const multer = require("multer");
const { uploadFile, deleteFile } = require("../controllers/fileControlllers");
const router = express.Router();
router.post("/delete", deleteFile);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
  fileFilter: function (req, file, cb) {
    const allowedMimes = ["image/jpeg", "image/png"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG and PNG files are allowed."));
    }
  },
});
router.post("/upload", upload.single("image"), uploadFile);
module.exports = router;
