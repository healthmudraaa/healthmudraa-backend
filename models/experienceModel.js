const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  desigination: { type: String, required: true },
  hosptalname: { type: String, required: true },
  location: { type: String, required: true },
  startdate: { type: Date, required: true },
  enddate: { type: Date, required: true },
});

const Experience = mongoose.model("Experience", experienceSchema);
module.exports = Experience;
