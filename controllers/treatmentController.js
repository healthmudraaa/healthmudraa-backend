const { default: mongoose } = require("mongoose");
const Treatment = require("../models/treatmentModel");
const Doctor = require("../models/doctorModel");
// get all treatment
const getAllTreatment = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    const treatments = await Treatment.aggregate([
      {
        $match: {
          $or: [
            {
              name: {
                $regex: new RegExp(searchTerm, "i"),
              },
            },
            {
              package: {
                $regex: new RegExp(searchTerm, "i"),
              },
            },
            {
              about: {
                $regex: new RegExp(searchTerm, "i"),
              },
            },
            {
              treatmentplace: {
                $regex: new RegExp(searchTerm, "i"),
              },
            },

            {
              inclusion: {
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
          name: 1,
          treatmentplace: 1,
          package: 1,
          about: 1,
          inclusion: 1,
          exclusion: 1,
          maxprice: 1,
          minprice: 1,
        },
      },
    ]);
    return res.status(200).json({
      status: 1,
      message: "details of all treatments",
      data: treatments,
      count: treatments.length,
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

// get a specific doctor
const getTreatment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ status: 0, message: "no such treatment found" });
  }
  const treatment = await Treatment.findById(id)
    .populate({
      path: "hospitalId",
      select: "hospitalName hospitalLocation hospitalprofileurl",
    })
    .populate({
      path: "doctorId",
      select: "firstname lastname profilepicurl specilization",
    });
  if (!treatment) {
    return res
      .status(404)
      .json({ status: 0, message: "no such treatment found" });
  }
  res.status(200).json({
    status: 1,
    message: "details of treament id-" + id,
    data: treatment,
  });
};

// create a treatment
const createTreatment = async (req, res) => {
  const doctorid = req.doctorid._id;
  const data = req.body;
  const emptyfiels = [];

  if (!data.avgpatientstreated) {
    emptyfiels.push("avgpatientstreated");
  }
  if (!data.package) {
    emptyfiels.push("package");
  }
  if (!data.minprice) {
    emptyfiels.push("minprice");
  }
  if (!data.maxprice) {
    emptyfiels.push("maxprice");
  }
  if (!data.avgpatientstreated) {
    emptyfiels.push("avgpatientstreated");
  }
  if (!data.inclusion) {
    emptyfiels.push("inclusion");
  }
  if (!data.exclusion) {
    emptyfiels.push("exclusion");
  }
  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  if (emptyfiels.length > 0) {
    return res
      .status(400)
      .json({ message: "Please fill all the fields", fields: emptyfiels });
  }

  try {
    const treatment = new Treatment(data);
    treatment.save();
    const doctor = await Doctor.findOneAndUpdate(
      { _id: doctorid },
      { $push: { treatments: treatment } }
    );
    if (!doctor) {
      return res
        .status(404)
        .json({ status: 0, message: "no such doctor found" });
    }
    res.status(200).json({
      status: 1,
      message: "treatment created successfully",
      data: treatment,
    });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

// update a doctor
const updateTreatment = async (req, res) => {
  const doctorid = req.doctorid._id;
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ status: 0, message: "no such treatment found" });
  }
  const treatment = await Treatment.findOneAndUpdate({ _id: id }, req.body);
  if (!treatment) {
    return res
      .status(404)
      .json({ status: 0, message: "no such treatment found" });
  }
  res.status(200).json({ status: 1, message: "updated successfull" });
};

// delete a doctor
const deleteTreatment = async (req, res) => {
  const doctorid = req.doctorid._id;
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ status: 0, message: "no such treatment found" });
  }
  const doctor = await Doctor.findOneAndUpdate(
    { _id: doctorid },
    { $push: { treatments: { _id: id } } }
  );
  const treatment = await Treatment.findOneAndDelete({ _id: id });
  if (!treatment) {
    return res
      .status(404)
      .json({ status: 0, message: "no such treatment found" });
  }
  res
    .status(200)
    .json({ status: 1, message: "treatment successfully deleted" });
};

module.exports = {
  getTreatment,
  createTreatment,
  getAllTreatment,
  updateTreatment,
  deleteTreatment,
};
