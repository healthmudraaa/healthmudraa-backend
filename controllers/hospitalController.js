const { default: mongoose } = require("mongoose");
const Hospital = require("../models/hospitalModel");
const Doctor = require("../models/doctorModel");
const Treatment = require("../models/treatmentModel");
// get all hospital
const getAllHospital = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    const hospitals = await Hospital.aggregate([
      {
        $match: {
          $or: [
            {
              hospitalName: {
                $regex: new RegExp(searchTerm, "i"),
              },
            },
            {
              hospitalLocation: {
                $regex: new RegExp(searchTerm, "i"),
              },
            },

            {
              specialities: {
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
          hospitalName: 1,
          hospitalLocation: 1,
          location: 1,
          branches: 1,
          hospitalprofileurl: 1,
          noofdoctors: 1,
          noofbeds: 1,
        },
      },
    ]);
    return res.status(200).json({
      status: 1,
      message: "details of all hospital",
      data: hospitals,
      count: hospitals.length,
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

// get a specifi hospital
const getHospital = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ status: 0, message: "no such hospital found" });
  }
  const desiredFields = "firstname lastname profilepicurl";
  const hospital = await Hospital.findById(id)
    .populate({
      path: "doctors",
      select: desiredFields,
    })
    .populate({
      path: "owner",
      select: "firstname lastname profilepicurl specilization",
    });

  const treatment = await Treatment.find({
    hospitalId: new mongoose.Types.ObjectId(id),
  });
  const result = { ...hospital._doc, treatment: treatment };

  if (!hospital) {
    return res
      .status(404)
      .json({ status: 0, message: "no such hospital found" });
  }
  res.status(200).json({
    status: 1,
    message: "details of hospital id-" + id,
    data: result,
  });
};

// get a hospital in locaiton
const getHospitalByLocation = async (req, res) => {
  const { latitude, longitude } = req.params;

  const hospital = await Hospital.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [latitude, longitude],
        },
        $maxDistance: 5000,
      },
    },
  });
  if (!hospital) {
    return res
      .status(400)
      .json({ status: 0, message: "no hospitals found in location" });
  }
  res
    .status(200)
    .json({ status: 1, message: "hospitals near you", data: hospital });
};

// create a hospital
const createHospital = async (req, res) => {
  const doctorid = req.doctorid._id;
  const data = req.body;
  const emptyfiels = [];
  if (!data.hospitalName) {
    emptyfiels.push("name");
  }
  if (!data.address) {
    emptyfiels.push("address");
  }
  if (!data.hospitalLocation) {
    emptyfiels.push("hospitalLocation");
  }
  if (!data.location) {
    emptyfiels.push("location");
  }
  if (!data.about) {
    emptyfiels.push("about");
  }

  if (!data.speciality) {
    emptyfiels.push("speciality");
  }
  if (!data.specialities) {
    emptyfiels.push("specialities");
  }
  if (!data.pricestarts) {
    emptyfiels.push("pricestarts");
  }
  if (!data.noofdoctors) {
    emptyfiels.push("noofdoctors");
  }
  if (!data.noofbeds) {
    emptyfiels.push("noofbeds");
  }
  if (!data.branches) {
    emptyfiels.push("branches");
  }
  if (!data.treated) {
    emptyfiels.push("treated");
  }
  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }

  if (emptyfiels.length > 0) {
    return res.status(400).json({
      status: 0,
      message: "Please fill all the fields",
      fields: emptyfiels,
    });
  }

  try {
    const hospital = new Hospital(data);
    hospital.save();
    const doctor = await Doctor.findOneAndUpdate(
      { _id: doctorid },
      { $push: { hospitals: hospital } }
    );
    if (!doctor) {
      return res
        .status(404)
        .json({ status: 0, message: "no such doctor found" });
    }
    res.status(200).json({
      status: 1,
      message: "Hospital created successful",
      data: hospital,
    });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

// update a hospital
const updateHospital = async (req, res) => {
  const doctorid = req.doctorid._id;
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ status: 0, message: "no such hospital found" });
  }
  const doctor = await Doctor.findOne({ _id: doctorid, hospitals: id });
  if (!doctor) {
    return res
      .status(404)
      .json({ status: 0, message: "access denied to update hospital" });
  }
  const hospital = await Hospital.findOneAndUpdate({ _id: id }, req.body);
  if (!hospital) {
    return res
      .status(404)
      .json({ status: 0, message: "no such hospital found" });
  }
  res.status(200).json({
    status: 1,
    message: "updated details successfully",
    data: hospital,
  });
};

// delete a hospital
const deleteHospital = async (req, res) => {
  const doctorid = req.doctorid._id;
  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ status: 0, message: "no such hospital found" });
  }
  const doctor = await Doctor.findOneAndUpdate(
    { _id: doctorid },
    { $pull: { hospitals: id } }
  );
  if (!doctor) {
    return res.status(404).json({ status: 0, message: "access denied" });
  }
  const hospital = await Hospital.findOneAndDelete({ _id: id });
  if (!hospital) {
    return res
      .status(404)
      .json({ status: 0, message: "no such hospital found" });
  }
  res.status(200).json({
    status: 1,
    message: "deleted hospital id-" + id + " successfully",
    data: hospital,
  });
};

module.exports = {
  getHospital,
  createHospital,
  getAllHospital,
  updateHospital,
  deleteHospital,
  getHospitalByLocation,
};
