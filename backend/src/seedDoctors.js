const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Doctor = require("./models/Doctor");
const Hospital = require("./models/Hospital");

const DEMO_PASSWORD = "Doctor123!";

const doctors = [
  // 1. Cardiologists
  {
    name: "Dr. Ahmed Khan",
    email: "ahmed.khan@medibook.demo",
    specialization: "Cardiologist",
    qualification: "MBBS, FCPS Cardiology",
    experience: 12,
    fee: 2000,
    hospital: "City General Hospital",
    city: "Lahore",
    bio: "Specializes in heart health, blood pressure, and cardiac care.",
  },
  {
    name: "Dr. Zain Abbas",
    email: "zain.abbas@medibook.demo",
    specialization: "Cardiologist",
    qualification: "MBBS, FCPS Cardiology",
    experience: 13,
    fee: 2500,
    hospital: "HealthFirst Medical Hospital",
    city: "Karachi",
    bio: "Focuses on cardiovascular health and preventive heart care.",
  },
  {
    name: "Dr. Hamid Rauf",
    email: "hamid.rauf@medibook.demo",
    specialization: "Cardiologist",
    qualification: "MBBS, MD Cardiology",
    experience: 9,
    fee: 2200,
    hospital: "Royal Health Hospital",
    city: "Lahore",
    bio: "Provides cardiac consultations and heart disease risk assessments.",
  },

  // 2. Dermatologists
  {
    name: "Dr. Sara Malik",
    email: "sara.malik@medibook.demo",
    specialization: "Dermatologist",
    qualification: "MBBS, FCPS Dermatology",
    experience: 8,
    fee: 1500,
    hospital: "MediCare Medical Center",
    city: "Lahore",
    bio: "Treats common skin conditions and provides dermatology consultations.",
  },
  {
    name: "Dr. Maryam Iqbal",
    email: "maryam.iqbal@medibook.demo",
    specialization: "Dermatologist",
    qualification: "MBBS, FCPS Dermatology",
    experience: 7,
    fee: 1700,
    hospital: "Al-Shifa Health Center",
    city: "Lahore",
    bio: "Specializes in skin health, acne, and general dermatology.",
  },
  {
    name: "Dr. Nadia Tariq",
    email: "nadia.tariq@medibook.demo",
    specialization: "Dermatologist",
    qualification: "MBBS, MCPS Dermatology",
    experience: 6,
    fee: 1600,
    hospital: "Islamabad Medical Centre",
    city: "Islamabad",
    bio: "Provides skin assessments and treatment consultations.",
  },

  // 3. Neurologists
  {
    name: "Dr. Usman Ali",
    email: "usman.ali@medibook.demo",
    specialization: "Neurologist",
    qualification: "MBBS, FCPS Neurology",
    experience: 10,
    fee: 2500,
    hospital: "Al-Shifa Health Center",
    city: "Lahore",
    bio: "Focuses on neurological assessments and nervous system disorders.",
  },
  {
    name: "Dr. Saad Qureshi",
    email: "saad.qureshi@medibook.demo",
    specialization: "Neurologist",
    qualification: "MBBS, FCPS Neurology",
    experience: 8,
    fee: 2300,
    hospital: "Central Care Hospital",
    city: "Islamabad",
    bio: "Provides consultations for headaches and neurological conditions.",
  },
  {
    name: "Dr. Kamran Shah",
    email: "kamran.shah@medibook.demo",
    specialization: "Neurologist",
    qualification: "MBBS, MD Neurology",
    experience: 11,
    fee: 2800,
    hospital: "Karachi City Medical Centre",
    city: "Karachi",
    bio: "Specializes in neurological evaluations and ongoing patient care.",
  },

  // 4. Pediatricians
  {
    name: "Dr. Ayesha Noor",
    email: "ayesha.noor@medibook.demo",
    specialization: "Pediatrician",
    qualification: "MBBS, FCPS Pediatrics",
    experience: 7,
    fee: 1800,
    hospital: "Central Care Hospital",
    city: "Islamabad",
    bio: "Provides general pediatric consultations and child wellness care.",
  },
  {
    name: "Dr. Bilal Siddiqui",
    email: "bilal.siddiqui@medibook.demo",
    specialization: "Pediatrician",
    qualification: "MBBS, FCPS Pediatrics",
    experience: 9,
    fee: 1900,
    hospital: "Lahore Care Hospital",
    city: "Lahore",
    bio: "Focuses on children's health, growth, and routine checkups.",
  },
  {
    name: "Dr. Eman Farooq",
    email: "eman.farooq@medibook.demo",
    specialization: "Pediatrician",
    qualification: "MBBS, MCPS Pediatrics",
    experience: 5,
    fee: 1500,
    hospital: "Karachi City Medical Centre",
    city: "Karachi",
    bio: "Provides child health consultations and preventive care.",
  },

  // 5. Orthopedic Surgeons
  {
    name: "Dr. Hamza Raza",
    email: "hamza.raza@medibook.demo",
    specialization: "Orthopedic Surgeon",
    qualification: "MBBS, MS Orthopedics",
    experience: 9,
    fee: 2200,
    hospital: "HealthFirst Medical Hospital",
    city: "Karachi",
    bio: "Provides orthopedic consultations for bones, joints, and injuries.",
  },
  {
    name: "Dr. Farhan Akhtar",
    email: "farhan.akhtar@medibook.demo",
    specialization: "Orthopedic Surgeon",
    qualification: "MBBS, FCPS Orthopedics",
    experience: 12,
    fee: 2500,
    hospital: "City General Hospital",
    city: "Lahore",
    bio: "Focuses on musculoskeletal conditions and injury assessments.",
  },
  {
    name: "Dr. Salman Yousaf",
    email: "salman.yousaf@medibook.demo",
    specialization: "Orthopedic Surgeon",
    qualification: "MBBS, MS Orthopedics",
    experience: 7,
    fee: 2000,
    hospital: "Islamabad Medical Centre",
    city: "Islamabad",
    bio: "Provides consultations for joint pain, fractures, and mobility concerns.",
  },

  // 6. Gynecologists
  {
    name: "Dr. Fatima Sheikh",
    email: "fatima.sheikh@medibook.demo",
    specialization: "Gynecologist",
    qualification: "MBBS, FCPS Obstetrics and Gynecology",
    experience: 11,
    fee: 2000,
    hospital: "City General Hospital",
    city: "Lahore",
    bio: "Provides women's health and gynecology consultations.",
  },
  {
    name: "Dr. Sana Khalid",
    email: "sana.khalid@medibook.demo",
    specialization: "Gynecologist",
    qualification: "MBBS, FCPS Gynecology",
    experience: 8,
    fee: 1800,
    hospital: "Royal Health Hospital",
    city: "Lahore",
    bio: "Focuses on women's health, routine checkups, and reproductive health.",
  },
  {
    name: "Dr. Rabia Aslam",
    email: "rabia.aslam@medibook.demo",
    specialization: "Gynecologist",
    qualification: "MBBS, FCPS Obstetrics and Gynecology",
    experience: 10,
    fee: 2200,
    hospital: "Central Care Hospital",
    city: "Islamabad",
    bio: "Provides gynecology consultations and women's wellness care.",
  },

  // 7. General Physicians
  {
    name: "Dr. Bilal Ahmed",
    email: "bilal.ahmed@medibook.demo",
    specialization: "General Physician",
    qualification: "MBBS",
    experience: 6,
    fee: 1000,
    hospital: "MediCare Medical Center",
    city: "Lahore",
    bio: "Provides general consultations and initial health assessments.",
  },
  {
    name: "Dr. Imran Javed",
    email: "imran.javed@medibook.demo",
    specialization: "General Physician",
    qualification: "MBBS, MCPS",
    experience: 8,
    fee: 1200,
    hospital: "Karachi City Medical Centre",
    city: "Karachi",
    bio: "Offers primary care consultations and routine health checkups.",
  },
  {
    name: "Dr. Haseeb Ahmed",
    email: "haseeb.ahmed@medibook.demo",
    specialization: "General Physician",
    qualification: "MBBS",
    experience: 5,
    fee: 900,
    hospital: "Lahore Care Hospital",
    city: "Lahore",
    bio: "Provides general medical consultations and preventive health advice.",
  },

  // 8. ENT Specialists
  {
    name: "Dr. Hira Javed",
    email: "hira.javed@medibook.demo",
    specialization: "ENT Specialist",
    qualification: "MBBS, FCPS ENT",
    experience: 5,
    fee: 1600,
    hospital: "Central Care Hospital",
    city: "Islamabad",
    bio: "Provides consultations for ear, nose, and throat conditions.",
  },
  {
    name: "Dr. Waqas Mir",
    email: "waqas.mir@medibook.demo",
    specialization: "ENT Specialist",
    qualification: "MBBS, FCPS ENT",
    experience: 9,
    fee: 1900,
    hospital: "HealthFirst Medical Hospital",
    city: "Karachi",
    bio: "Focuses on ENT assessments and common ear and sinus conditions.",
  },
  {
    name: "Dr. Noor Fatima",
    email: "noor.fatima@medibook.demo",
    specialization: "ENT Specialist",
    qualification: "MBBS, MCPS ENT",
    experience: 6,
    fee: 1500,
    hospital: "MediCare Medical Center",
    city: "Lahore",
    bio: "Provides ear, nose, and throat consultations.",
  },

  // 9. Endocrinologists
  {
    name: "Dr. Adeel Hussain",
    email: "adeel.hussain@medibook.demo",
    specialization: "Endocrinologist",
    qualification: "MBBS, FCPS Endocrinology",
    experience: 10,
    fee: 2300,
    hospital: "Royal Health Hospital",
    city: "Lahore",
    bio: "Provides consultations for hormonal and metabolic conditions.",
  },
  {
    name: "Dr. Mehwish Raza",
    email: "mehwish.raza@medibook.demo",
    specialization: "Endocrinologist",
    qualification: "MBBS, FCPS Endocrinology",
    experience: 7,
    fee: 2000,
    hospital: "Islamabad Medical Centre",
    city: "Islamabad",
    bio: "Focuses on endocrine health and metabolic assessments.",
  },
  {
    name: "Dr. Taha Siddiq",
    email: "taha.siddiq@medibook.demo",
    specialization: "Endocrinologist",
    qualification: "MBBS, MD Endocrinology",
    experience: 8,
    fee: 2100,
    hospital: "Al-Shifa Health Center",
    city: "Lahore",
    bio: "Provides consultations for endocrine and metabolic health concerns.",
  },
];

async function seedDoctors() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    let added = 0;
    let skipped = 0;
    let failed = 0;

    for (const doctorData of doctors) {
      try {
        const hospital = await Hospital.findOne({
          name: doctorData.hospital,
          city: doctorData.city,
        });

        if (!hospital) {
          console.log(
            `Skipped: Hospital not found - ${doctorData.hospital}`
          );
          skipped++;
          continue;
        }

        let user = await User.findOne({
          email: doctorData.email.toLowerCase(),
        });

        if (user && user.role !== "doctor") {
          console.log(`Skipped: Email belongs to another role - ${doctorData.email}`);
          skipped++;
          continue;
        }

        if (user) {
          const existingProfile = await Doctor.findOne({
            user: user._id,
          });

          if (existingProfile) {
            await Doctor.updateOne(
              { _id: existingProfile._id },
              { $set: { isVerified: true, isActive: true } }
            );
            console.log(`Updated active/verified status for: ${doctorData.name}`);
            skipped++;
            continue;
          }
        } else {
          user = await User.create({
            name: doctorData.name,
            email: doctorData.email.toLowerCase(),
            password: passwordHash,
            role: "doctor",
          });
        }

        await Doctor.create({
          user: user._id,
          hospital: hospital._id,
          specialization: doctorData.specialization,
          qualification: doctorData.qualification,
          experience: doctorData.experience,
          fee: doctorData.fee,
          bio: doctorData.bio,
          isVerified: true,
          isActive: true,
        });

        console.log(
          `Added: ${doctorData.name} - ${doctorData.specialization} (${hospital.name})`
        );
        added++;
      } catch (error) {
        console.error(
          `Failed: ${doctorData.name} - ${error.message}`
        );
        failed++;
      }
    }

    const totalDoctors = await Doctor.countDocuments();

    console.log("\nDoctor seeding completed.");
    console.log(`Added this run: ${added}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total doctor profiles in database: ${totalDoctors}`);
    console.log(`Demo password for newly created accounts: ${DEMO_PASSWORD}`);
  } catch (error) {
    console.error("Doctor seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDoctors();
