const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leadSchema = new Schema({
  name: {
    type: String,
  },
  mobile: {
    type: String,
  },
  email: {
    type: String,
  },
  doctorId: {
    type: String,
  },
  pageUrl: {
    type: String,
  },
});

module.exports = mongoose.model("Leads", leadSchema);
