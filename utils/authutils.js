const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "balakrishna1431313@gmail.com",
    pass: process.env.EMAIL_SECRET,
  },
});

async function sendPasswordResetLink(email, token) {
  const mailOptions = {
    from: "healthmudhra@gmail.com",
    to: email,
    subject: "Reset your password",
    text: `Click the link below to reset your password:\n\nhttps://health-mudhra.vercel.app/doctor/resetpassword?token=${token}`,
  };
  await transporter.sendMail(mailOptions);
}

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECERT, { expiresIn: "3d" });
};

module.exports = { sendPasswordResetLink, createToken };
