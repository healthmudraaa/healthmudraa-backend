const { default: mongoose } = require("mongoose");
const Request = require("../models/requestModel");
const Doctor = require("../models/doctorModel");
const Hospital = require("../models/hospitalModel");

const createRequest = async (req, res) => {
  try {
    const doctorid = req.doctorid._id;
    const data = req.body;
    data.doctorId = doctorid;

    const requestdetails = await Request.aggregate([
      {
        $match: {
          doctorId: doctorid,
          hospitalId: data.hospitalId,
        },
      },
    ]);
    if (requestdetails.length != 0) {
      return res.status(200).json({
        status: 0,
        message: "already a request exists",
      });
    }
    const doctordetails = await Doctor.findById(doctorid).select(
      "firstname lastname profilepicurl"
    );
    const hospitaldetails = await Hospital.findById(data.hospitalId).select(
      "hospitalName hospitalprofileurl"
    );
    console.log(doctordetails, hospitaldetails);
    data.doctorname = doctordetails.firstname + " " + doctordetails.lastname;
    data.doctorprofileurl = doctordetails.profilepicurl;
    data.hospitalname = hospitaldetails.hospitalName;
    data.hospitalprofileurl = hospitaldetails.hospitalprofileurl;
    const request = new Request(data);
    res.status(200).json({
      status: 1,
      message: "Sent Request Successfully",
    });
    request.save();
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

const searchHospitals = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    const hospitals = await Hospital.aggregate([
      {
        $match: {
          hospitalName: {
            $regex: new RegExp(searchTerm, "i"),
          },
        },
      },
      {
        $project: {
          hospitalName: 1,
          hospitalLocation: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 1,
      message: "details of the hospitals",
      data: hospitals,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

const getRequests = async (req, res) => {
  try {
    const doctorid = req.doctorid._id;
    const requests = await Doctor.aggregate([
      { $match: { _id: doctorid } },
      {
        $project: {
          hospitals: 1,
        },
      },
      {
        $lookup: {
          from: "requests",
          localField: "hospitals",
          foreignField: "hospitalId",
          as: "requests",
        },
      },
      {
        $project: {
          requests: 1,
        },
      },
    ]);
    res.status(200).json({
      status: 1,
      message: "Detials of all Requests",
      data: requests[0],
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

const getSentRequests = async (req, res) => {
  try {
    const doctorid = req.doctorid._id;
    const requests = await Request.aggregate([
      { $match: { doctorId: doctorid } },
    ]);
    res.status(200).json({
      status: 1,
      message: "Detials of all Requests",
      data: requests,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};
const updateRequest = async (req, res) => {
  try {
    const doctorid = req.doctorid._id;
    const data = req.body;
    console.log(doctorid, data.hospitalId);
    const doctordetails = await Doctor.aggregate([
      {
        $match: {
          _id: doctorid,
          hospitals: {
            $elemMatch: {
              $eq: new mongoose.Types.ObjectId(data.hospitalId),
            },
          },
        },
      },
    ]);

    if (doctordetails.length == 0) {
      return res.status(200).json({
        status: 0,
        message: "you are not authorized to update",
      });
    }
    const { id } = req.params;

    const request = await Request.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });
    console.log(request);
    if (request.status == "Accept") {
      const updatedRequest = await Hospital.findOneAndUpdate(
        { _id: request.hospitalId },
        { $addToSet: { doctors: request.doctorId } },
        { new: true }
      );
      if (!updatedRequest) {
        return res.status(400).json({
          status: 0,
          message: "something went wrong",
        });
      }
    }
    if (request.status == "Remove") {
      const updatedRequest = await Hospital.findOneAndUpdate(
        { _id: request.hospitalId },
        { $pull: { doctors: request.doctorId } },
        { new: true }
      );
      const deleteRequest = await Request.findOneAndDelete({
        _id: request._id,
      });

      if (!updatedRequest) {
        return res.status(400).json({
          status: 0,
          message: "something went wrong",
        });
      }
    }

    res.status(200).json({
      status: 1,
      message: "details updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ status: 0, message: "Internal Server Error" });
  }
};

module.exports = {
  createRequest,
  getRequests,
  updateRequest,
  getSentRequests,
  searchHospitals,
};
