const { default: mongoose } = require("mongoose");
const Hospital = require("../models/hospitalModel");
const Doctor = require("../models/doctorModel");
const Treatment = require("../models/treatmentModel");
const Video = require("../models/videoModel");
// get all video
const getAllVideos = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    const videos = await Video.aggregate([
      {
        $match: {
          $or: [
            {
              title: {
                $regex: new RegExp(searchTerm, "i"),
              },
            },
            {
              description: {
                $regex: new RegExp(searchTerm, "i"),
              },
            },
          ],
        },
      },

      {
        $project: {
          _id: 1,
          link: 1,
          title: 1,
          description: 1,
          category: 1,
          doctorId: 1,
        },
      },
    ]);
    return res.status(200).json({
      status: 1,
      message: "details of all videos",
      data: videos,
      count: videos.length,
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

// get a specific video
const getVideo = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ status: 0, message: "no such video found" });
  }

  const video = await Video.findById(id);

  if (!video) {
    return res.status(404).json({ status: 0, message: "no such video found" });
  }
  res.status(200).json({
    status: 1,
    message: "details of video id-" + id,
    data: video,
  });
};

const getVideoByDoctor = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }

  const videos = await Video.find({ doctorId: id });

  if (!videos) {
    return res.status(404).json({ status: 0, message: "no  videos found" });
  }
  res.status(200).json({
    status: 1,
    message: "details of doctor -" + id,
    data: videos,
  });
};

// create a video
const createVideo = async (req, res) => {
  try {
    const doctorid = req.doctorid._id;
    const data = req.body;
    const emptyfiels = [];
    if (!data.link) {
      emptyfiels.push("link");
    }
    if (!data.title) {
      emptyfiels.push("title");
    }
    if (!data.description) {
      emptyfiels.push("description");
    }
    if (!data.category) {
      emptyfiels.push("category");
    }

    if (!mongoose.Types.ObjectId.isValid(doctorid)) {
      return res
        .status(404)
        .json({ status: 0, message: "here no such doctor found" });
    }

    if (emptyfiels.length > 0) {
      return res.status(400).json({
        status: 0,
        message: "Please fill all the fields",
        fields: emptyfiels,
      });
    }

    const video = new Video({ ...data, doctorId: doctorid });
    video.save();
    const doctor = await Doctor.findOne({ _id: doctorid });
    if (!doctor) {
      return res
        .status(404)
        .json({ status: 0, message: "here no such doctor found" });
    }
    res.status(200).json({
      status: 1,
      message: "Video created successful",
      data: video,
    });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

// update a video
const updateVideo = async (req, res) => {
  const doctorid = req.doctorid._id;
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ status: 0, message: "no such video found" });
  }
  const video = await Video.findOne(
    { doctorId: doctorid, _id: id },
    { new: true }
  );
  if (!video) {
    return res
      .status(404)
      .json({ status: 0, message: "access denied to update video" });
  }
  const updatevideo = await Video.findOneAndUpdate({ _id: id }, req.body);
  if (!updatevideo) {
    return res.status(404).json({ status: 0, message: "no such video found" });
  }
  res.status(200).json({
    status: 1,
    message: "updated details successfully",
    data: updatevideo,
  });
};

// delete a video
const deleteVideo = async (req, res) => {
  const doctorid = req.doctorid._id;
  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ status: 0, message: "no such video found" });
  }
  const doctor = await Video.findOneAndDelete({ _id: id, doctorId: doctorid });
  if (!doctor) {
    return res.status(404).json({ status: 0, message: "access denied" });
  }

  res.status(200).json({
    status: 1,
    message: "deleted video id-" + id + " successfully",
    data: doctor,
  });
};

module.exports = {
  getVideo,
  createVideo,
  getAllVideos,
  updateVideo,
  deleteVideo,
  getVideoByDoctor,
};
