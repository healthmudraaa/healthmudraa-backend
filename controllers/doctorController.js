const { default: mongoose } = require("mongoose");
const Doctor = require("../models/doctorModel");
const Leads = require("../models/leadsModel");
const { sendPasswordResetLink, createToken } = require("../utils/authutils");
const { generateTokens, verifyToken } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

// login user
const signinUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const doctor = await Doctor.signin(email, password);
    const token = await generateTokens(doctor._id, "doctor");
    res.status(200).json({
      name: doctor.name,
      email,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });
  } catch (error) {
    res.status(400).json({ status: 0, message: error.message });
  }
};
const signupUser = async (req, res) => {
  const { countrycode, mobile, email, password } = req.body;
  console.log(req.body);
  try {
    const doctor = await Doctor.signup({
      countrycode,
      mobile,
      email,
      password,
    });
    const token = await generateTokens(doctor._id, "doctor");
    res.status(200).json({
      email,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });
  } catch (error) {
    res.status(400).json({ status: 0, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      res.status(404).json({ message: "No such user found" });
      return;
    }
    const token = await doctor.generatePasswordResetToken();
    await sendPasswordResetLink(email, token);
    res.status(200).json({ status: 1, message: "email sent successfully" });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const doctor = await Doctor.findOne({ passwordResetToken: token });
    if (!doctor) {
      res.status(404).json({ status: 0, message: "Invalid Token" });
      return;
    }
    await doctor.updatePassword(password);
    res
      .status(200)
      .json({ status: 1, message: "Password Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: 0, message: "Internal server Error" });
  }
};

// get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const desiredFields =
      "firstname lastname specilization location   qualifications address profilepicurl seotitle seodescription    experiences  noofyearsexp averagepatientstreated      hospitals clinic  homevisit onlinevisit     video";

    const doctors = await Doctor.find()
      .populate("hospitals")
      .select(desiredFields);
    res.status(200).json({
      status: 1,
      message: "details of all doctors",
      data: doctors,
      count: doctors.length,
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

// get a specific doctor
const getDoctor = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  const desiredFields =
    "firstname lastname specilization location about gender qualifications address profilepicurl seotitle seodescription  countrycode mobile experiences registration noofyearsexp averagepatientstreated Memebership  email   hospitals clinic languages homevisit onlinevisit govtId locationcord awards gallery video ";
  const doctor = await Doctor.findById(id)
    .populate("treatments")
    .populate("hospitals")
    .select(desiredFields);
  if (!doctor) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  res
    .status(200)
    .json({ status: 1, message: "details of doctor id-" + id, data: doctor });
};

// get a specific doctor
const getDoctorDetails = async (req, res) => {
  const doctorid = req.doctorid._id.toString();

  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  const desiredFields =
    "firstname lastname specilization location about gender qualifications address profilepicurl seotitle seodescription  countrycode mobile experiences registration noofyearsexp averagepatientstreated Memebership  email   hospitals clinic languages homevisit onlinevisit govtId locationcord awards gallery video treatments";
  const doctor = await Doctor.findById(doctorid)
    .where({ status: "active" })
    .select(desiredFields)
    .populate("treatments")
    .populate("hospitals");
  if (!doctor) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  res
    .status(200)
    .json({ status: 1, message: "details of doctor ", data: doctor });
};

// get doctor based on specilization
const specilizedDoctors = async (req, res) => {
  try {
    const { specilizations } = req.body;
    const desiredFields =
      "firstname lastname specilization location   qualifications address profilepicurl seotitle seodescription    experiences  noofyearsexp averagepatientstreated      hospitals clinic  homevisit onlinevisit     video";

    const doctors = await Doctor.find({
      specilization: { $in: specilizations },
      verified: true,
      status: "active",
    })
      .populate("hospitals")
      .select(desiredFields);
    res.status(200).json({
      status: 1,
      message: "details of all doctors",
      data: doctors,
      count: doctors.length,
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

const searchDoctors = async (req, res) => {
  try {
    const { searchTerm } = req.query;

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
              location: {
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
        $lookup: {
          from: "hospitals",
          localField: "hospitals",
          foreignField: "_id",
          as: "result",
        },
      },

      {
        $project: {
          _id: 1,

          firstname: 1,
          lastname: 1,
          location: 1,
          specilization: 1,
          profilepicurl: 1,
          hospitals: "$result",
          experiences: 1,
          qualifications: 1,
        },
      },
    ]);
    return res.status(200).json({
      status: 1,
      message: "details of all doctors",
      data: doctors,
      count: doctors.length,
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

// create a doctor
const createDoctor = async (req, res) => {
  const data = req.body;
  const emptyfiels = [];
  if (!data.firstname) {
    emptyfiels.push("name");
  }
  if (!data.specilization) {
    emptyfiels.push("specilization");
  }
  if (!data.qualifications) {
    emptyfiels.push("qualifications");
  }
  if (!data.experiences) {
    emptyfiels.push("experiences");
  }
  if (!data.noofyearsexp) {
    emptyfiels.push("noofyearsexp");
  }
  if (!data.averagepatientstreated) {
    emptyfiels.push("averagepatientstreated");
  }
  if (!data.seotitle) {
    emptyfiels.push("seotitle");
  }
  if (!data.seodescription) {
    emptyfiels.push("seodescription");
  }
  if (!data.urlslug) {
    emptyfiels.push("urlslug");
  }
  if (!data.about) {
    emptyfiels.push("about");
  }
  if (!data.address) {
    emptyfiels.push("address");
  }

  if (emptyfiels.length > 0) {
    return res
      .status(400)
      .json({ message: "Please fill all the fields", fields: emptyfiels });
  }

  try {
    const doctor = new Doctor(data);
    doctor.save();
    res.status(200).json({
      status: 0,
      message: "doctor created successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

//update password
const changePassword = async (req, res) => {
  const doctorid = req.doctorid._id.toString();
  const { password } = req.body;
  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  const salt = await bcrypt.genSalt(process.env.SALT);
  const hash = await bcrypt.hash(password, salt);

  const doctor = await Doctor.findOneAndUpdate(
    { _id: doctorid },
    { password: hash }
  );
  if (!doctor) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  res.status(200).json({ status: 1, message: "updated successfull" });
};

// update a doctor
const updateDoctor = async (req, res) => {
  const doctorid = req.doctorid._id.toString();
  console.log(doctorid);
  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  const doctor = await Doctor.findOneAndUpdate({ _id: doctorid }, req.body);
  if (!doctor) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  res.status(200).json({ status: 1, message: "updated successfull" });
};

// delete a doctor
const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  const doctor = await Doctor.findOneAndDelete({ _id: id });
  if (!doctor) {
    return res.status(404).json({ status: 0, message: "no such doctor found" });
  }
  res.status(200).json({ message: "doctor deleted successfully" });
};

//refresh Token
const refreshDoctorToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const _id = await verifyToken(refreshToken, "doctor");
    const payload = { _id };
    const accessToken = jwt.sign(payload, process.env.SECERT, {
      expiresIn: "2m",
    });
    const tempid = jwt.verify(accessToken, process.env.SECERT);
    console.log("verified", tempid);
    res.status(200).json({
      status: 1,
      accessToken,
      message: "Access token created successfully",
    });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

// get specific doctor leads
const getDoctorLeads = async (req, res) => {
  const doctorid = req.doctorid._id.toString();

  if (!mongoose.Types.ObjectId.isValid(doctorid)) {
    return res.status(404).json({ status: 0, message: "no leads found" });
  }
  const doctor = await Leads.find({ doctorId: doctorid });
  if (!doctor) {
    return res.status(404).json({ status: 0, message: "no leads found" });
  }
  res
    .status(200)
    .json({ status: 1, message: "leads of doctor ", data: doctor });
};

module.exports = {
  getDoctor,
  createDoctor,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  signinUser,
  signupUser,
  updatePassword,
  forgotPassword,
  refreshDoctorToken,
  getDoctorDetails,
  specilizedDoctors,
  changePassword,
  searchDoctors,
  getDoctorLeads,
};
