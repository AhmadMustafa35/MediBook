const mongoose = require("mongoose");
require("dotenv").config();

const Hospital = require("./models/Hospital");

const hospitals = [
  {
    name: "City General Hospital",
    city: "Lahore",
    address: "Main Boulevard, Gulberg, Lahore",
    phone: "0300-1000001",
    email: "citygeneral@example.com",
    description:
      "A demo multi-specialty hospital providing general healthcare and specialist consultations.",
    isVerified: true,
    isActive: true,
  },
  {
    name: "MediCare Medical Center",
    city: "Lahore",
    address: "Model Town, Lahore",
    phone: "0300-1000002",
    email: "medicare@example.com",
    description:
      "A demo medical centre offering outpatient care and specialist appointments.",
    isVerified: true,
    isActive: true,
  },
  {
    name: "Al-Shifa Health Center",
    city: "Lahore",
    address: "Johar Town, Lahore",
    phone: "0300-1000003",
    email: "alshifa@example.com",
    description:
      "A demo healthcare centre for family medicine and specialist consultations.",
    isVerified: true,
    isActive: true,
  },
  {
    name: "Central Care Hospital",
    city: "Islamabad",
    address: "F-8 Markaz, Islamabad",
    phone: "0300-1000004",
    email: "centralcare@example.com",
    description:
      "A demo hospital offering general medical care and outpatient consultations.",
    isVerified: true,
    isActive: true,
  },
  {
    name: "HealthFirst Medical Hospital",
    city: "Karachi",
    address: "Shahrah-e-Faisal, Karachi",
    phone: "0300-1000005",
    email: "healthfirst@example.com",
    description:
      "A demo hospital providing general healthcare and specialist appointment services.",
    isVerified: true,
    isActive: true,
  },
  {
    name: "Lahore Care Hospital",
    city: "Lahore",
    address: "DHA Phase 5, Lahore",
    phone: "0300-1110001",
    email: "lahorecare@example.com",
    description:
      "A demo multi-specialty hospital offering general medical consultations and specialist care.",
    isVerified: true,
    isActive: true,
  },
  {
    name: "Royal Health Hospital",
    city: "Lahore",
    address: "Canal Road, Lahore",
    phone: "0300-1110002",
    email: "royalhealth@example.com",
    description:
      "A demo hospital providing outpatient consultations and specialist appointments.",
    isVerified: true,
    isActive: true,
  },
  {
    name: "Islamabad Medical Centre",
    city: "Islamabad",
    address: "Blue Area, Islamabad",
    phone: "0300-1110003",
    email: "islamabadmedical@example.com",
    description:
      "A demo medical centre for family medicine, diagnostics, and specialist consultations.",
    isVerified: true,
    isActive: true,
  },
  {
    name: "Karachi City Medical Centre",
    city: "Karachi",
    address: "Gulshan-e-Iqbal, Karachi",
    phone: "0300-1110004",
    email: "karachicity@example.com",
    description:
      "A demo medical centre offering general healthcare and specialist appointment services.",
    isVerified: true,
    isActive: true,
  },
];

async function seedHospitals() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");

    let added = 0;
    let skipped = 0;

    for (const hospitalData of hospitals) {
      const existingHospital = await Hospital.findOne({
        name: hospitalData.name,
        city: hospitalData.city,
      });

      if (existingHospital) {
        console.log(`Already exists: ${hospitalData.name}`);
        skipped++;
        continue;
      }

      await Hospital.create(hospitalData);

      console.log(`Added: ${hospitalData.name}`);
      added++;
    }

    const total = await Hospital.countDocuments();

    console.log("\nHospital seeding completed.");
    console.log(`Added: ${added}`);
    console.log(`Already existed: ${skipped}`);
    console.log(`Total hospitals in database: ${total}`);
  } catch (error) {
    console.error("Hospital seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedHospitals();
