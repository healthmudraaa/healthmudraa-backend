const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const doctorRoutes = require("./routes/doctorRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const treatementRoutes = require("./routes/treatmentRoutes");
const userRoutes = require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes");
const homeRoutes = require("./routes/homeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const requestRoutes = require("./routes/requestRoutes");
const videoRoutes = require("./routes/videoRoutes");
const leadsRoutes = require("./routes/leadsRoutes");
const app = express();
// middlewares

app.use(cors({ origin: "*" }));
app.use("/file", fileRoutes);
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello API");
});
app.use("/doctors", doctorRoutes);
app.use("/hospitals", hospitalRoutes);
app.use("/treatments", treatementRoutes);
app.use("/users", userRoutes);
app.use("/homepage", homeRoutes);
app.use("/admin", adminRoutes);
app.use("/hospitalrequest", requestRoutes);
app.use("/video", videoRoutes);
app.use("/leads", leadsRoutes);

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(8080, () =>
      console.log("connected to database && server is live at port 5000")
    );
  })
  .catch((error) => console.log(error));

module.exports = app;
