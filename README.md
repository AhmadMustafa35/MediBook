# 🏥 MediBook — Doctor Appointment Booking Platform

> A full-stack MERN application that connects patients with doctors. Browse hospitals, find specialists, book appointments, and pay securely online — all in one place.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [App Pages & Flow](#app-pages--flow)
- [Roles & Permissions](#roles--permissions)
- [Database Models](#database-models)
- [Payment Flow (Stripe)](#payment-flow-stripe)
- [Seed Data](#seed-data)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 About the Project

**MediBook** is a modern healthcare appointment platform built with the MERN stack (MongoDB, Express, React, Node.js). Patients can discover hospitals, filter doctors by specialization, schedule appointments on available time slots, and pay securely via Stripe. Doctors can self-register their profiles and manage their appointments. Admins can verify doctors and oversee the platform.

---

## ✨ Features

### 👤 Patient
- Register & log in with JWT-based authentication
- Browse all hospitals and view hospital details
- Browse & filter doctors by specialization
- View doctor profile, qualifications, fees, bio, and reviews
- Book appointments on available time slots
- Pay for appointments online via **Stripe Checkout**
- Cancel appointments
- View & manage all appointments from personal dashboard
- Edit profile, change password, delete account
- Password reset via email (Nodemailer / SMTP)

### 🩺 Doctor
- Self-register a doctor profile (linked to a user account)
- View and manage personal appointments
- Update appointment statuses (confirmed / completed / cancelled)
- Update personal doctor profile

### 🛡️ Admin
- Create & manage doctor profiles
- Verify / unverify doctors
- Activate / suspend doctor accounts
- View all doctors in the system

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 8** | Build tool & dev server |
| **React Router DOM v7** | Client-side routing |
| **Axios** | HTTP requests to backend API |
| **Stripe React + Stripe.js** | Stripe payment integration |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework & API server |
| **MongoDB + Mongoose 9** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Stripe SDK** | Payment processing |
| **Nodemailer** | Email (password reset) |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |
| **Nodemon** | Auto-restart in development |

---

## 📁 Project Structure

```
MediBook/
├── backend/
│   ├── src/
│   │   ├── config/             # DB config
│   │   ├── controllers/        # Route handler logic
│   │   │   ├── authController.js
│   │   │   ├── doctorController.js
│   │   │   ├── hospitalController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── reviewController.js
│   │   │   ├── scheduleController.js
│   │   │   ├── subscriptionController.js
│   │   │   └── webhookController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT protect middleware
│   │   │   └── roleMiddleware.js   # Role-based access control
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Doctor.js
│   │   │   ├── Hospital.js
│   │   │   ├── Appointment.js
│   │   │   ├── Schedule.js
│   │   │   ├── Review.js
│   │   │   └── Subscription.js
│   │   ├── routes/             # Express route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── doctorRoutes.js
│   │   │   ├── hospitalRoutes.js
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   ├── scheduleRoutes.js
│   │   │   ├── subscriptionRoutes.js
│   │   │   └── webhookRoutes.js
│   │   ├── seedDoctors.js      # Seed script for doctors
│   │   ├── seedHospitals.js    # Seed script for hospitals
│   │   └── server.js           # App entry point
│   ├── .env                    # Backend environment variables
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/             # Static images/icons
    │   ├── components/
    │   │   └── Navbar.jsx      # Top navigation bar
    │   ├── pages/              # One file per page/route
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Doctors.jsx
    │   │   ├── DoctorDetails.jsx
    │   │   ├── DoctorRegister.jsx
    │   │   ├── Booking.jsx
    │   │   ├── Hospitals.jsx
    │   │   ├── HospitalDetails.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── PaymentSuccess.jsx
    │   │   ├── PaymentCancelled.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── ChangePassword.jsx
    │   │   ├── EditProfile.jsx
    │   │   └── DeleteAccount.jsx
    │   ├── services/           # Axios API call functions
    │   ├── utils/              # Helper utilities
    │   ├── App.jsx             # Root component & routing
    │   └── main.jsx            # React entry point
    ├── index.html
    ├── vite.config.js
    ├── .env                    # Frontend environment variables
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- A [MongoDB](https://www.mongodb.com/) instance — local or [MongoDB Atlas](https://www.mongodb.com/atlas)
- A [Stripe](https://stripe.com/) account with test API keys

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/MediBook.git
cd MediBook
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

**3. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

---

### Environment Variables

#### 🔧 Backend — `backend/.env`

Create a `.env` file inside the `backend/` folder:

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/medibook

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_google_app_password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

> **Note:** For Gmail SMTP, enable 2FA and create an [App Password](https://myaccount.google.com/apppasswords).

#### 🔧 Frontend — `frontend/.env`

Create a `.env` file inside the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

### Running the Application

You need **two terminals** — one for the backend and one for the frontend.

#### Terminal 1 — Start the Backend

```bash
cd backend
npm run dev
```

The backend API will start at: **http://localhost:5000**

You should see:
```
Connecting to Database...
✅ Database Connection Established Successfully
🚀 MediBook Backend Server running on port 5000
```

#### Terminal 2 — Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will start at: **http://localhost:5173**

Open your browser and go to: **http://localhost:5173**

---

### Health Check

Once the backend is running, verify it is live:

```
GET http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "MediBook API is running smoothly",
  "timestamp": "..."
}
```

---

## 📡 API Endpoints

> All protected routes require the `Authorization: Bearer <token>` header.

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register a new patient |
| POST | `/login` | Public | Login and get JWT token |
| GET | `/me` | Protected | Get logged-in user details |
| POST | `/logout` | Protected | Logout |
| PUT | `/profile` | Protected | Update user profile |
| PUT | `/change-password` | Protected | Change password |
| DELETE | `/account` | Protected | Delete account |
| POST | `/forgot-password` | Public | Send password reset email |
| POST | `/reset-password/:token` | Public | Reset password with token |

### Doctors — `/api/doctors`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all doctors (with filters) |
| GET | `/:id` | Public | Get single doctor |
| POST | `/register` | Doctor | Self-register a doctor profile |
| GET | `/me` | Doctor | Get own doctor profile |
| PUT | `/me` | Doctor | Update own doctor profile |
| POST | `/` | Admin | Create a doctor |
| GET | `/admin/all` | Admin | Get all doctors |
| PUT | `/admin/:id/verify` | Admin | Verify a doctor |
| PUT | `/admin/:id/status` | Admin | Activate/suspend a doctor |

### Hospitals — `/api/hospitals`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all hospitals |
| GET | `/:id` | Public | Get single hospital |

### Appointments — `/api/appointments`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Patient | Book an appointment |
| GET | `/my` | Patient | Get my appointments |
| PUT | `/:id/cancel` | Patient | Cancel an appointment |
| POST | `/:id/pay` | Patient | Initiate Stripe payment |
| POST | `/:id/checkout-session` | Patient | Create Stripe checkout session |
| POST/GET | `/:id/verify-payment` | Patient | Verify Stripe payment result |
| GET | `/doctor/my` | Doctor | Get doctor's appointments |
| PUT | `/doctor/:id/status` | Doctor | Update appointment status |

### Reviews — `/api/reviews`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Patient | Add a review |
| GET | `/:doctorId` | Public | Get reviews for a doctor |

### Schedules — `/api/schedules`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Doctor | Create a schedule |
| GET | `/:doctorId` | Public | Get doctor's available slots |

### Stripe Webhook — `/api/webhooks`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Stripe webhook event handler |

---

## 🗺️ App Pages & Flow

```
/                      → Home page (hero, featured doctors & hospitals)
/register              → Patient registration
/login                 → Login
/forgot-password       → Request password reset email
/reset-password/:token → Set new password

/hospitals             → Browse all hospitals
/hospitals/:id         → Hospital detail page

/doctors               → Browse all doctors (filter by specialization)
/doctors/:id           → Doctor detail + reviews + available slots

/booking/:doctorId     → Book an appointment [🔒 Login required]
/checkout/:appointmentId → Stripe payment checkout [🔒 Login required]
/payment/success       → Payment success page
/payment/cancelled     → Payment cancelled page

/dashboard             → Patient dashboard: appointments & profile [🔒 Login required]
/edit-profile          → Edit user info [🔒 Login required]
/change-password       → Change password [🔒 Login required]
/delete-account        → Delete account [🔒 Login required]
```

---

## 🔐 Roles & Permissions

| Role | Description |
|------|-------------|
| `patient` | Default role for all registered users. Can book, pay, review, and cancel appointments. |
| `doctor` | Can self-register a profile, manage own schedule, and update appointment statuses. |
| `admin` | Can create doctors, verify them, and control their active status. |

Authentication is handled with **JWT tokens** stored in `localStorage` (`medibookToken`). Protected routes redirect to `/login` if no token is found.

---

## 🗃️ Database Models

| Model | Key Fields |
|-------|-----------|
| **User** | name, email, password (hashed), role, avatar |
| **Doctor** | user (ref), hospital (ref), specialization, qualification, experience, fee, bio, isVerified, isActive |
| **Hospital** | name, address, city, image, description |
| **Appointment** | patient, doctor, hospital, date, startTime, endTime, reason, status, paymentStatus, stripeSessionId |
| **Schedule** | doctor, date, timeSlots (array) |
| **Review** | patient, doctor, rating, comment |
| **Subscription** | user, plan, stripeSubscriptionId, status |

---

## 💳 Payment Flow (Stripe)

1. Patient books an appointment → status: `pending`, paymentStatus: `pending`
2. Patient clicks **Pay Now** → backend creates a Stripe Checkout Session
3. Patient is redirected to Stripe hosted checkout page
4. On success → redirected to `/payment/success`
5. Backend verifies payment via `/api/appointments/:id/verify-payment`
6. Appointment paymentStatus updated to `paid`
7. Stripe webhook at `/api/webhooks` handles async events (backup verification)

> Uses **Stripe Test Mode** by default. Use Stripe test card `4242 4242 4242 4242` with any future expiry and any CVC.

---

## 🌱 Seed Data

To quickly populate the database with sample data for development:

```bash
cd backend

# Seed hospitals
node src/seedHospitals.js

# Seed doctors
node src/seedDoctors.js
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">Built with ❤️ using the MERN Stack</p>
