const AWS = require("aws-sdk");
const fs = require("fs");
require("dotenv").config();
// Configure AWS SDK with your DigitalOcean Spaces credentials
AWS.config.update({
  accessKeyId: process.env.DIGITAL_SPACE_ACCESSKEY,
  secretAccessKey: process.env.DIGITAL_SPACE_ACCESSKEY,
  endpoint: process.env.DIGITAL_SPACE_URL, // This should be your Space's endpoint
  s3ForcePathStyle: true, // Required for DigitalOcean Spaces
});

const uploadFile = () => {
  // Create an S3 object
  const s3 = new AWS.S3();

  // Set the name of your Space and the name you want for the uploaded file
  const spaceName = "hmv";
  const fileName = "balakrishna.png"; // Change this to your desired file name
  const filePath = "./public/uploads/balakrishna.png"; // Change this to the path of your image

  // Read the file
  const fileContent = fs.readFileSync(filePath);

  // Create an S3 object with the specified parameters
  const params = {
    Bucket: spaceName,
    Key: fileName,
    Body: fileContent,
  };

  // Upload the file
  s3.upload(params, (err, data) => {
    if (err) {
      console.error("Error uploading the file:", err);
    } else {
      console.log("File uploaded successfully. URL:", data.Location);
    }
  });
};
uploadFile();
