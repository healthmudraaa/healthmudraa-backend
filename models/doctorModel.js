const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const doctorSchema = new Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  specilization: {
    type: [String],

    default: [],
  },
  location: {
    type: String,
  },
  locationcord: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number],
    },
  },
  about: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Others"],
  },
  qualifications: [
    {
      degree: {
        type: String,
        required: true,
        trim: true,
      },
      collegeName: {
        type: String,
        required: true,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
      },
      certificateurl: {
        type: String,
        required: true,
      },
      fromYear: {
        type: Number,
        required: true,
      },
      toYear: {
        type: Number,
        required: true,
      },
    },
  ],
  address: {
    type: String,
  },
  profilepicurl: {
    type: String,
  },
  seotitle: {
    type: String,
  },
  seodescription: {
    type: String,
  },
  urlslug: {
    type: String,
  },

  countrycode: {
    type: String,
    required: [true, "Doctor should have a countrycode"],
  },
  mobile: {
    type: String,
    required: [true, "Doctor should have a mobile"],
  },
  experiences: {
    type: [
      {
        desigination: { type: String, required: true },
        hosptalname: { type: String, required: true },
        location: { type: String, required: true },
        experienceurl: {
          type: String,
          required: true,
        },
        startdate: { type: String, required: true },
        enddate: { type: String, required: true },
        currentlyworking: { type: Boolean, required: true, default: false },
      },
    ],
    default: [],
  },
  registration: {
    type: [
      {
        regno: String,
        council: String,
        year: String,
        registrationurl: {
          type: String,
          required: true,
        },
      },
    ],
  },
  noofyearsexp: {
    type: Number,
  },
  averagepatientstreated: {
    type: Number,
  },
  Memebership: { type: [String] },
  password: {
    type: String,
    require: [true, "doctor should have a password"],
  },
  email: {
    type: String,
    require: [true, "doctor should have a email"],
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
  hospitals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hospital" }],
  treatments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Treatment" }],
  clinic: { type: String },
  languages: { type: [String] },
  homevisit: { type: Boolean },
  onlinevisit: { type: Boolean },
  govtId: [
    {
      proofType: String,
      proofNumber: String,
      govtIdurl: { type: String, required: true },
    },
  ],
  token: {
    type: String,
  },
  awards: [String],

  video: [
    { link: String, title: String, description: String, category: String },
  ],
  verified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["block", "inactive", "active"],
    default: "active",
  },
});

doctorSchema.statics.signup = async function (doctordata) {
  const { countrycode, mobile, email, password } = doctordata;
  if (!countrycode || !mobile || !email || !password) {
    throw Error("All fields must be filled");
  }
  if (!validator.isEmail(email)) {
    throw Error("Please enter a valid email");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Please entere a strong password");
  }
  const existingdoctor = await this.findOne({ email });
  if (existingdoctor) {
    throw Error("Email is already in use");
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
  const hash = await bcrypt.hash(password, salt);
  const doctor = await this.create({ ...doctordata, password: hash });
  return doctor;
};

doctorSchema.statics.signin = async function (email, password) {
  if (!email || !password) {
    throw Error("Please ensure all fields are filled");
  }
  const doctor = await this.findOne({ email });
  if (!doctor) {
    throw Error("Incorrect Email");
  }
  const passwordmatch = await bcrypt.compare(password, doctor.password);
  if (!passwordmatch) {
    throw Error("Incorrect Password");
  }
  return doctor;
};

doctorSchema.methods.generatePasswordResetToken = async function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 3600000;
  await this.save();
  return token;
};
doctorSchema.methods.updatePassword = async function (newpassword) {
  if (Date.now() > this.passwordResetExpires) {
    throw Error("Password reset link experied");
  }
  const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
  const hash = await bcrypt.hash(newpassword, salt);
  this.password = hash;
  this.passwordResetExpires = null;
  this.passwordResetToken = null;
  await this.save();
};

module.exports = mongoose.model("Doctor", doctorSchema);
