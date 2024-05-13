const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoSchema = new Schema({
  link: {
    type: String,
    require: [true, "video should have a link"],
  },
  title: {
    type: String,
    require: [true, "video should have a title"],
  },
  description: {
    type: String,
    require: [true, "video should have a description"],
  },
  category: {
    type: String,
    require: [true, "video should have a category"],
  },
  doctorId: {
    type: mongoose.Types.ObjectId,
    ref: "Doctor",
  },
});

module.exports = mongoose.model("Video", videoSchema);
