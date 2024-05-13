const { default: mongoose } = require("mongoose");
const { sendPasswordResetLink, createToken } = require("../utils/authutils");
const { generateTokens, verifyToken } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const Hospital = require("../models/hospitalModel");
const Treatment = require("../models/treatmentModel");

// login admin
const signinAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.signin(email, password);
    const token = await generateTokens(admin._id, "admin");
    res.status(200).json({
      name: admin.name,
      email,
      id: admin.id,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });
  } catch (error) {
    res.status(400).json({ status: 0, message: error.message });
  }
};

const signupAdmin = async (req, res) => {
  const { countrycode, mobile, email, password } = req.body;
  console.log(req.body);
  try {
    const admin = await Admin.signup({
      countrycode,
      mobile,
      email,
      password,
    });
    const token = await generateTokens(admin._id, "admin");
    res.status(200).json({
      email,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });
  } catch (error) {
    res.status(400).json({ status: 0, message: error.message });
  }
};

const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const _id = await verifyToken(refreshToken, "admin");
    const payload = { _id };
    const accessToken = jwt.sign(payload, process.env.SECERT, {
      expiresIn: "2m",
    });
    const tempid = jwt.verify(accessToken, process.env.SECERT);

    res.status(200).json({
      status: 1,
      accessToken,
      message: "Access token created successfully",
    });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(404).json({ message: "No such admin found" });
      return;
    }
    const token = await admin.generatePasswordResetToken();
    await sendPasswordResetLink(email, token);
    res.status(200).json({ status: 1, message: "email sent successfully" });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const admin = await Admin.findOne({ passwordResetToken: token });
    if (!admin) {
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

const getAllDoctor = async (req, res) => {
  try {
    const { pagesize, pageno, searchterm } = req.query;
    const pageSizeInt = parseInt(pagesize);
    const search = req.query.searchterm.toLowerCase();
    const pageNoInt = parseInt(pageno);
    const skip = pageNoInt * pageSizeInt;
    const limit = pageSizeInt;
    const desiredFields = "firstname lastname email mobile status verified";
    const query = {
      $or: [
        { firstname: { $regex: new RegExp(search, "i") } },
        { lastname: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { mobile: { $regex: new RegExp(search, "i") } },
      ],
    };
    const doctors = await Doctor.find(query)
      .select(desiredFields)
      .skip(skip)
      .limit(limit)
      .exec();
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

// update a doctor
const updateDoctor = async (req, res) => {
  const { doctorid } = req.params;

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
  res.status(200).json({ status: 1, message: "doctor deleted successfully" });
};

const createDoctor = async (req, res) => {
  const data = req.body;
  const emptyfiels = [];
  if (!data.firstname) {
    emptyfiels.push("firstname");
  }
  if (!data.lastname) {
    emptyfiels.push("lastname");
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
//user

const getAllUsers = async (req, res) => {
  try {
    const { pagesize, pageno, searchterm } = req.query;
    const pageSizeInt = parseInt(pagesize);
    const search = req.query.searchterm.toLowerCase();
    const pageNoInt = parseInt(pageno);
    const skip = pageNoInt * pageSizeInt;
    const limit = pageSizeInt;
    const desiredFields = "firstname lastname email  mobile status";
    const query = {
      $or: [
        { firstname: { $regex: new RegExp(search, "i") } },
        { lastname: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { mobile: { $regex: new RegExp(search, "i") } },
      ],
    };
    const users = await User.find(query)
      .select(desiredFields)
      .skip(skip)
      .limit(limit)
      .exec();
    res.status(200).json({
      status: 1,
      message: "details of all users",
      data: users,
      count: users.length,
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

const createUser = async (req, res) => {
  const data = req.body;
  const emptyfiels = [];
  if (!data.firstname) {
    emptyfiels.push("firstname");
  }
  if (!data.lastname) {
    emptyfiels.push("lastname");
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
    const user = new User(data);
    user.save();
    res.status(200).json({
      status: 0,
      message: "user created successfully",
      data: user,
    });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { userid } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  const user = await User.findOneAndUpdate({ _id: userid }, req.body);
  if (!user) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  res.status(200).json({ status: 1, message: "updated successfull" });
};

// delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  const user = await User.findOneAndDelete({ _id: id });
  if (!user) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  res.status(200).json({ status: 1, message: "user deleted successfully" });
};

// get a specific doctor
const getUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  const desiredFields = "firstname lastname email countrycode mobile";
  const user = await User.findById(id).select(desiredFields);
  if (!user) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  res
    .status(200)
    .json({ status: 1, message: "details of user id-" + id, data: user });
};

// create a hospital
const createHospital = async (req, res) => {
  const { doctorid } = req.query;
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
  const { doctorid } = req.query;
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
  const { doctorid } = req.query;
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

// create a treatment
const createTreatment = async (req, res) => {
  const { doctorid } = req.query;
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
  const { doctorid } = req.query;
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
  const { doctorid } = req.query;
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
  signinAdmin,
  signupAdmin,
  refreshAdminToken,
  updatePassword,
  forgotPassword,
  getAllDoctor,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  createDoctor,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser,
  createHospital,
  updateHospital,
  deleteHospital,
  createTreatment,
  updateTreatment,
  deleteTreatment,
};
