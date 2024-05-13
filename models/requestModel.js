const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requestSchema = new Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  status: {
    type: String,
    enum: ["Accept", "Reject", "Pending", "Remove"],
    default: "Pending",
  },
  hospitalprofileurl: {
    type: String,
  },
  doctorprofileurl: {
    type: String,
  },
  doctorname: {
    type: String,
  },
  hospitalname: {
    type: String,
  },
});

module.exports = mongoose.model("Request", requestSchema);
