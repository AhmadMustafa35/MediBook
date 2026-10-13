const Hospital = require("../models/Hospital");

// =========================
// CREATE HOSPITAL
// =========================
const createHospital = async (req, res) => {
  try {
    const {
      name,
      city,
      address,
      phone,
      email,
      description,
      logo,
      coverImage,
    } = req.body;

    // Validate required fields
    if (!name || !city || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, city and address are required",
      });
    }

    // Check duplicate hospital
    const existingHospital = await Hospital.findOne({
      name,
      city,
    });

    if (existingHospital) {
      return res.status(400).json({
        success: false,
        message: "Hospital already exists in this city",
      });
    }

    // Create hospital
    const hospital = await Hospital.create({
      name,
      city,
      address,
      phone,
      email,
      description,
      logo: logo || "",
      coverImage: coverImage || "",
      isVerified: true,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      hospital,
    });
  } catch (error) {
    console.error("Create hospital error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET ALL PUBLIC HOSPITALS
// =========================
const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({
      isActive: { $ne: false },
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    console.error("Get hospitals error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET SINGLE PUBLIC HOSPITAL
// =========================
const getHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({
      _id: req.params.id,
      isActive: { $ne: false },
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    res.status(200).json({
      success: true,
      hospital,
    });
  } catch (error) {
    console.error("Get hospital error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET ALL HOSPITALS - ADMIN
// =========================
const getAllHospitalsAdmin = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    console.error("Admin get hospitals error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// VERIFY HOSPITAL
// =========================
const verifyHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    hospital.isVerified = true;

    await hospital.save();

    res.status(200).json({
      success: true,
      message: "Hospital verified successfully",
      hospital,
    });
  } catch (error) {
    console.error("Verify hospital error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// UPDATE HOSPITAL STATUS
// =========================
const updateHospitalStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    // Validate status
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    hospital.isActive = isActive;

    await hospital.save();

    res.status(200).json({
      success: true,
      message: isActive
        ? "Hospital activated successfully"
        : "Hospital suspended successfully",
      hospital,
    });
  } catch (error) {
    console.error("Update hospital status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// EXPORT CONTROLLERS
// =========================
module.exports = {
  createHospital,
  getHospitals,
  getHospital,
  getAllHospitalsAdmin,
  verifyHospital,
  updateHospitalStatus,
};