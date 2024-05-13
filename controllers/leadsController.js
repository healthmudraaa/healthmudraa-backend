const Leads = require("../models/leadsModel");

const createLeads = async (req, res) => {
  const data = req.body;
  if (!data.name) {
    return res.status(404).json({
      status: 0,
      message: "name is not provied",
    });
  }
  if (!data.mobile) {
    return res.status(404).json({
      status: 0,
      message: "phone number is mandatory",
    });
  }
  try {
    const leads = new Leads(data);
    leads.save();
    res.status(200).json({
      status: 0,
      message: "leads created successfully",
    });
  } catch (error) {
    res.status(404).json({ status: 0, message: error.message });
  }
};

module.exports = {
  createLeads,
};
