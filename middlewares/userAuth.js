const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: "Authorization token Required" });
  }
  const token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECERT);
    req.userid = await User.findOne({ _id }).select("_id");
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Authorization token is not authorized" });
  }
};
module.exports = requireAuth;
