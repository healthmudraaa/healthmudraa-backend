const { default: mongoose } = require("mongoose");
const User = require("../models/userModel");
const { sendPasswordResetLink, createToken } = require("../utils/authutils");
const { generateTokens, verifyToken } = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

//get Details
const getUserDetails = async (req, res) => {
  const userid = req.userid._id.toString();

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  const desiredFields = "firstname lastname email mobile";
  const user = await User.findById(userid)
    .where({ status: "active" })
    .select(desiredFields);

  if (!user) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  res.status(200).json({ status: 1, message: "details of user ", data: user });
};

const updateUser = async (req, res) => {
  const userid = req.userid._id.toString();

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  const user = await User.findOneAndUpdate({ _id: userid }, req.body);
  if (!user) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  res.status(200).json({ status: 1, message: "updated successfull" });
};
const changePassword = async (req, res) => {
  const userid = req.userid._id.toString();
  const { password } = req.body;
  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  const salt = await bcrypt.genSalt(process.env.SALT);
  const hash = await bcrypt.hash(password, salt);

  const user = await User.findOneAndUpdate({ _id: userid }, { password: hash });
  if (!user) {
    return res.status(404).json({ status: 0, message: "no such user found" });
  }
  res.status(200).json({ status: 1, message: "updated successfull" });
};

// login user
const signinUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.signin(email, password);
    const token = await generateTokens(user._id, "user");
    res.status(200).json({
      name: user.name,
      email,
      id: user.id,
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
    const user = await User.signup({ countrycode, mobile, email, password });
    const token = await generateTokens(user._id, "user");
    res.status(200).json({
      name: user.name,
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
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ status: 0, message: "No such user found" });
    }
    const token = await user.generatePasswordResetToken();
    await sendPasswordResetLink(email, token);
    res.status(200).json({ status: 1, message: "email sent successfully" });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ passwordResetToken: token });
    if (!user) {
      res.status(404).json({ message: "Invalid Token" });
    }
    await user.updatePassword(password);
    res.status(200).json({ message: "Password Updated Succefully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const refreshUserToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const { id } = verifyToken(refreshToken, "doctor");
    const payload = { _id: id };
    const accessToken = jwt.sign(payload, process.env.SECERT, {
      expiresIn: "14m",
    });
    res.status(200).json({
      status: 1,
      accessToken,
      message: "Access token created successfully",
    });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

module.exports = {
  updateUser,
  getUserDetails,
  signinUser,
  signupUser,
  changePassword,
  forgotPassword,
  updatePassword,
  refreshUserToken,
};
