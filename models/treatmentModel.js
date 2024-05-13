const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const treatmentSchema = new Schema({
  name: {
    type: String,
  },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  avgpatientstreated: {
    type: Number,
    required: [true, "Patients treated should hava a address"],
  },
  package: {
    type: String,
    required: [true, "Package should not be empty"],
  },
  minprice: {
    type: Number,
  },
  treatmentplace: {
    type: String,
    required: true,
  },
  maxprice: {
    type: Number,
  },
  inclusion: {
    type: [String],
  },
  noofsessions: { type: Number },
  noofdays: { type: Number },
  exclusion: {
    type: [String],
  },
  about: { type: String, required: true },
});

module.exports = mongoose.model("Treatment", treatmentSchema);
