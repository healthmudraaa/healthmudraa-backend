const aws = require("aws-sdk");
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESSKEY,
  secretAccessKey: process.env.AWS_SECRETKEY,
  region: "ap-south-1",
});

const uploadFile = (req, res) => {
  console.log(req.file);
  const fileName = `${Date.now()}-${req.file.originalname}`;
  const params = {
    Bucket: "healthmudraa-assets",
    Key: fileName,
    Body: req.file.buffer,
    // ACL: "public-read", // Make this object publicly readable
    ContentDisposition: "inline",
    ContentType: req.file.mimetype,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.json({ status: 0, message: "Something went wrong" });
    } else {
      console.log("File uploaded successfully. File URL:", data.Location);
      return res.json({
        status: 1,
        message: "Image uploaded successfully",
        data: { fileName },
      });
    }
  });
};

const deleteFile = (req, res) => {
  const { fileName } = req.query;
  const params = {
    Bucket: "healthmudhra",
    Key: fileName,
  };

  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.json({
        status: 0,
        message: "Something went wrong while deleting the image",
      });
    } else {
      console.log("File deleted successfully.");
      return res.json({ status: 1, message: "Image deleted successfully" });
    }
  });
};

module.exports = { uploadFile, deleteFile };
