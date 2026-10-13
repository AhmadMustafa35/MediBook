const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const bcrypt = require("bcryptjs");

// =========================
// CREATE DOCTOR
// =========================
const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      hospital,
      specialization,
      qualification,
      experience,
      fee,
      bio,
      phone,
      profileImage,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !hospital ||
      !specialization ||
      !qualification ||
      fee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, hospital, specialization, qualification and fee are required",
      });
    }

    // Check hospital
    const hospitalExists = await Hospital.findOne({
      _id: hospital,
      isActive: { $ne: false },
    });

    if (!hospitalExists) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Check email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      hospital: hospitalExists._id,
      specialization,
      qualification,
      experience: experience || 0,
      fee,
      bio: bio || "",
      phone: phone || "",
      profileImage: profileImage || "",
      isVerified: true,
      isActive: true,
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate("user", "name email role profileImage avatar")
      .populate("hospital", "name city address coverImage logo phone");

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor: populatedDoctor,
    });
  } catch (error) {
    console.error("Create doctor error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET ALL PUBLIC DOCTORS
// =========================
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      isActive: { $ne: false },
    })
      .populate("user", "name email role profileImage avatar")
      .populate("hospital", "name city address phone coverImage logo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET SINGLE DOCTOR
// =========================
const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      _id: req.params.id,
      isActive: { $ne: false },
    })
      .populate("user", "name email role profileImage avatar")
      .populate("hospital", "name city address phone coverImage logo description");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get doctor error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET ALL DOCTORS - ADMIN
// =========================
const getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("user", "name email role profileImage avatar")
      .populate("hospital", "name city address coverImage logo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Admin get doctors error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// VERIFY DOCTOR
// =========================
const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.isVerified = true;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor verified successfully",
      doctor,
    });
  } catch (error) {
    console.error("Verify doctor error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// UPDATE DOCTOR STATUS
// =========================
const updateDoctorStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.isActive = isActive;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: isActive
        ? "Doctor activated successfully"
        : "Doctor suspended successfully",
      doctor,
    });
  } catch (error) {
    console.error("Update doctor status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// SELF-REGISTER DOCTOR PROFILE
// =========================
const registerDoctorProfile = async (req, res) => {
  try {
    // 1. Check if user already has a doctor profile
    const existingProfile = await Doctor.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "You already have a doctor profile",
      });
    }

    const {
      hospital,
      specialization,
      qualification,
      fee,
      experience,
      bio,
      phone,
      profileImage,
    } = req.body;

    // 2. Validate required fields
    if (!hospital || !specialization || !qualification || fee === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "hospital, specialization, qualification and fee are required",
      });
    }

    // 3. Check hospital exists and is active
    const hospitalExists = await Hospital.findOne({
      _id: hospital,
      isActive: { $ne: false },
    });

    if (!hospitalExists) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // 4. Update user role to 'doctor'
    await User.findByIdAndUpdate(
      req.user._id,
      { role: "doctor" },
      { new: true }
    );

    // 5. Create doctor profile (unverified by default)
    const doctor = await Doctor.create({
      user: req.user._id,
      hospital: hospitalExists._id,
      specialization,
      qualification,
      experience: experience || 0,
      fee,
      bio: bio || "",
      phone: phone || "",
      profileImage: profileImage || "",
      isVerified: false,
      isActive: true,
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate("user", "name email role profileImage avatar")
      .populate("hospital", "name city address coverImage logo phone");

    res.status(201).json({
      success: true,
      message:
        "Doctor profile submitted successfully. Awaiting admin verification.",
      doctor: populatedDoctor,
    });
  } catch (error) {
    console.error("Register doctor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET MY DOCTOR PROFILE
// =========================
const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate("user", "name email role profileImage avatar")
      .populate("hospital", "name city address phone coverImage logo description");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get my doctor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// UPDATE MY DOCTOR PROFILE
// =========================
const updateMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // Only allow updating permitted fields
    const allowedFields = [
      "bio",
      "phone",
      "fee",
      "experience",
      "qualification",
      "specialization",
      "profileImage",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    await doctor.save();

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate("user", "name email role profileImage avatar")
      .populate("hospital", "name city address phone coverImage logo description");

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor: populatedDoctor,
    });
  } catch (error) {
    console.error("Update my doctor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// EXPORT
// =========================
module.exports = {
  createDoctor,
  getDoctors,
  getDoctor,
  getAllDoctorsAdmin,
  verifyDoctor,
  updateDoctorStatus,
  registerDoctorProfile,
  getMyDoctorProfile,
  updateMyDoctorProfile,
};