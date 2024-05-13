const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  firstname: {
    type: String,
    default: "",
  },
  lastname: {
    type: String,
    default: "",
  },

  password: {
    type: String,
    require: [true, "user should have a password"],
  },
  email: {
    type: String,
    require: [true, "user should have a email"],
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
  countrycode: {
    type: String,
    required: [true, "Doctor should have a countrycode"],
  },
  mobile: {
    type: Number,
    required: [true, "Doctor should have a mobile"],
  },
  token: {
    type: String,
  },
});

adminSchema.statics.signup = async function (userdata) {
  const { countrycode, mobile, email, password } = userdata;
  if (!countrycode || !mobile || !email || !password) {
    throw Error("All fields must be filled");
  }
  if (!validator.isEmail(email)) {
    throw Error("Please enter a valid email");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Please entere a strong password");
  }
  const existinguser = await this.findOne({ email });
  if (existinguser) {
    throw Error("Email is already in use");
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({ ...userdata, password: hash });
  return user;
};

adminSchema.statics.signin = async function (email, password) {
  if (!email || !password) {
    throw Error("Please ensure all fields are filled");
  }
  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Incorrect Email");
  }
  const passwordmatch = await bcrypt.compare(password, user.password);
  if (!passwordmatch) {
    throw Error("Incorrect Password");
  }
  return user;
};

adminSchema.methods.generatePasswordResetToken = async function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 3600000;
  await this.save();
  return token;
};
adminSchema.methods.updatePassword = async function (newpassword) {
  if (Date.now() > this.passwordResetExpires) {
    throw Error("Password reset link experied");
  }
  const salt = await bcrypt.genSalt(process.env.SALT);
  const hash = await bcrypt.hash(newpassword, salt);
  this.password = hash;
  this.passwordResetExpires = null;
  this.passwordResetToken = null;
  await this.save();
};

module.exports = mongoose.model("Admin", adminSchema);
