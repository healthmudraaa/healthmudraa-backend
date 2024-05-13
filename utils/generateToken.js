const jwt = require("jsonwebtoken");
const Doctor = require("../models/doctorModel.js");
const User = require("../models/userModel.js");
const Admin  = require("../models/adminModel.js")

const generateTokens = async (id, type) => {
  try {
    const payload = { _id: id };
    const accessToken = jwt.sign(payload, process.env.SECERT, {
      expiresIn: "2m",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESHSECERT, {
      expiresIn: "30d",
    });

    const { _id } = jwt.verify(accessToken, process.env.SECERT);
    if (type == "doctor") {
      const doctor = await Doctor.findOneAndUpdate(
        { _id: id },
        { token: refreshToken }
      );
      if (!doctor) {
        throw Error({ message: "no such doctor found" });
      }
    }
    else if (type == "admin") {
      const admin = await Admin.findOneAndUpdate(
        { _id: id },
        { token: refreshToken }
      );
      if (!admin) {
        throw Error({ message: "no such admin found" });
      }
    }  else {
      const user = await User.findOneAndUpdate(
        { _id: id },
        { token: refreshToken }
      );
      if (!user) {
        throw Error({ message: "no such user found" });
      }
    }
    return { accessToken, refreshToken };
  } catch (err) {
    throw Error(err);
  }
};

const verifyToken = async (refreshToken, type) => {
  try {
    if (type == "doctor") {
      const doctor = await Doctor.findOne({ token: refreshToken });
      if (!doctor) {
        throw Error({ message: "Invalid refresh token" });
      }
    } 
    else if (type == "admin") {
      const admin = await Admin.findOne({ token: refreshToken });
      if (!admin) {
        throw Error({ message: "Invalid refresh token" });
      }
    }else {
      const user = await User.findOne({ token: refreshToken });
      if (!user) {
        throw Error({ message: "Invalid refresh token" });
      }
    }
    const { _id } = jwt.verify(refreshToken, process.env.REFRESHSECERT);
    return _id;
  } catch (error) {
    throw Error(error);
  }
};

module.exports = { generateTokens, verifyToken };
