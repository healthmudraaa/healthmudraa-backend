const { default: mongoose } = require("mongoose");
const Doctor = require("../models/doctorModel");
const Video = require("../models/videoModel");
const Hospital = require("../models/hospitalModel");
const Treatment = require("../models/treatmentModel");

const homePage = async (req, res) => {
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
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: {
          path: "$doctor",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "hospitals",
          localField: "doctor.hospitals",
          foreignField: "_id",
          as: "temphospital",
        },
      },
      {
        $project: {
          _id: 1,
          video: { link: "$link" },
          doctorId: "$doctor._id",
          firstname: "$doctor.firstname",
          lastname: "$doctor.lastname",
          location: "$doctor.location",
          specilization: "$doctor.specilization",
          category: 1,
          description: 1,
          title: 1,
          experiences: "$doctor.experiences",
          qualifications: "$doctor.qualifications",
          hospitals: "$temphospital.hospitalName",
          profilepicurl: "$doctor.profilepicurl",
        },
      },
    ]);

    res.status(200).json({
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

const videoPage = async (req, res) => {
  try {
    const { videocode } = req.query;

    const videos = await Video.aggregate([
      {
        $match: {
          $or: [
            {
              title: {
                $regex: new RegExp(videocode, "i"),
              },
            },
          ],
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

const servicesPage = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    if (searchTerm) {
      const doctors = await Doctor.aggregate([
        { $match: { verified: true, status: "active" } },

        {
          $match: {
            $or: [
              {
                firstname: {
                  $regex: new RegExp(searchTerm, "i"),
                },
              },
              {
                lastname: {
                  $regex: new RegExp(searchTerm, "i"),
                },
              },
              {
                specilization: {
                  $elemMatch: {
                    $regex: new RegExp(searchTerm, "i"),
                  },
                },
              },
            ],
          },
        },

        {
          $project: {
            _id: 1,
            video: 1,
            firstname: 1,
            lastname: 1,
            location: 1,
            specilization: 1,
            profilepicurl: 1,
            hospitals: 1,
          },
        },
      ]);

      const hospitals = await Hospital.aggregate([
        {
          $match: {
            hospitalName: {
              $regex: new RegExp(searchTerm, "i"),
            },
          },
        },
      ]);

      const treatments = await Treatment.aggregate([
        {
          $match: {
            package: {
              $regex: new RegExp(searchTerm, "i"),
            },
          },
        },
      ]);
      return res.status(200).json({
        status: 1,
        message: "details of all services",
        data: { doctors, hospitals, treatments },
      });
    }

    const desiredFields =
      "firstname lastname specilization  about  qualifications  profilepicurl seotitle seodescription    experiences  noofyearsexp averagepatientstreated      hospitals clinic video";

    const doctors = await Doctor.find({ status: "active", verified: true })
      .populate("hospitals")
      .select(desiredFields);

    const hospitals = await Hospital.find();

    const treatments = await Treatment.find();
    res.status(200).json({
      status: 1,
      message: "details of all services",
      data: { doctors, hospitals, treatments },
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

module.exports = {
  homePage,
  servicesPage,
  videoPage,
};
