const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hospitalSchema = new Schema({
  hospitalName: {
    type: String,
    required: [true, "Hospital should hava a name"],
  },
  address: {
    type: String,
    required: [true, "Hospital should hava a address"],
  },
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  hospitalLocation: {
    type: String,
    required: true,
  },
  about: {
    type: String,
  },

  hospitalprofileurl: {
    type: String,
  },
  speciality: {
    type: String,
  },
  specialities: {
    type: [String],
  },
  pricestarts: { type: Number },
  noofdoctors: { type: Number },
  noofbeds: { type: Number },
  branches: { type: Number },
  treated: { type: Number },
  currentlyworking: { type: Boolean, default: false },
  establishedyear: { type: Number },
  gallery: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
});

hospitalSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Hospital", hospitalSchema);
