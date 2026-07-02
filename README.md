# Society Maintenance Tracker

A full-stack web app where residents raise maintenance complaints, admins manage them with priority and status updates, and everyone stays informed through a notice board and email notifications.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | HTML, CSS, EJS (templating)         |
| Backend  | Node.js, Express.js                 |
| Database | MongoDB Atlas + Mongoose            |
| Email    | Nodemailer (Gmail SMTP)             |
| Auth     | express-session + bcryptjs          |
| Uploads  | Multer (local disk, public/uploads) |

---

## Setup Guide

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd society-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your .env file
```bash
cp .env.example .env
```
Then open `.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string
- `SESSION_SECRET` — any random string
- `EMAIL_USER` — your Gmail address
- `EMAIL_PASS` — a Gmail **App Password** (not your normal password)
  - Go to: Google Account → Security → 2-Step Verification → App Passwords

### 4. Seed the admin account
```bash
node seed-admin.js
```
This creates one admin user: `admin@society.com` / `admin123`
You can change these values inside `seed-admin.js` before running.

### 5. Start the app
```bash
npm start        # production
npm run dev      # development (auto-restarts with nodemon)
```

### 6. Open in browser
```
http://localhost:3000
```

---

## Roles & Access

| Feature                       | Resident | Admin |
|-------------------------------|----------|-------|
| Register / Login              | ✅       | ✅    |
| Raise a complaint (with photo)| ✅       | ❌    |
| View own complaints + history | ✅       | ❌    |
| View notice board             | ✅       | ✅    |
| View ALL complaints           | ❌       | ✅    |
| Filter complaints             | ❌       | ✅    |
| Update status + priority      | ❌       | ✅    |
| Post notices (pin important)  | ❌       | ✅    |
| Dashboard / stats             | ❌       | ✅    |
| Configure overdue threshold   | ❌       | ✅    |

---

## Database Schema

### User
```
name         String  (required)
email        String  (unique, required)
password     String  (bcrypt hashed)
flatNumber   String  (residents only, e.g. "A-101")
role         "resident" | "admin"
createdAt    Date
updatedAt    Date
```

### Complaint
```
resident     ObjectId → User
category     "Plumbing" | "Electrical" | "Cleanliness" | "Security" | "Parking" | "Other"
description  String
photo        String  (filename saved under public/uploads/complaints/)
status       "Open" | "In Progress" | "Resolved"
priority     "Low" | "Medium" | "High"
isOverdue    Boolean
resolvedAt   Date
history[]    embedded array of status changes:
  - status     String
  - changedBy  ObjectId → User
  - note       String
  - changedAt  Date
createdAt    Date
updatedAt    Date
```

### Notice
```
title        String
content      String
postedBy     ObjectId → User
isImportant  Boolean  (pins notice to top + triggers emails)
createdAt    Date
updatedAt    Date
```

### Settings (single document)
```
overdueThresholdDays  Number  (default: 5)
```

---

## API / Route Docs

### Auth routes — /auth
| Method | Route            | Description              |
|--------|------------------|--------------------------|
| GET    | /auth/register   | Show register form        |
| POST   | /auth/register   | Create resident account   |
| GET    | /auth/login      | Show login form           |
| POST   | /auth/login      | Login (sets session)      |
| GET    | /auth/logout     | Logout (destroys session) |

### Resident routes — /resident (must be logged in as resident)
| Method | Route                    | Description                   |
|--------|--------------------------|-------------------------------|
| GET    | /resident/complaints     | List my complaints            |
| GET    | /resident/complaints/new | Show raise-complaint form     |
| POST   | /resident/complaints     | Submit new complaint + photo  |
| GET    | /resident/complaints/:id | View complaint + history      |
| GET    | /resident/notices        | View notice board             |

### Admin routes — /admin (must be logged in as admin)
| Method | Route                          | Description                           |
|--------|--------------------------------|---------------------------------------|
| GET    | /admin/dashboard               | Stats: totals by status/category      |
| GET    | /admin/complaints              | List all complaints (filterable)      |
| GET    | /admin/complaints/:id          | View complaint detail + history       |
| POST   | /admin/complaints/:id/status   | Update status, priority, add note     |
| GET    | /admin/notices                 | View + post notices                   |
| POST   | /admin/notices                 | Post a notice (important = pin+email) |
| GET    | /admin/settings                | View overdue threshold setting        |
| POST   | /admin/settings                | Update overdue threshold              |

---

## System Design Notes

### Complaint History Model
Status history is stored as an **embedded array** inside each Complaint document. Every status change pushes a new entry with: the new status, who changed it, when, and an optional note. This means the full audit trail is always fetched in a single query with the complaint — no JOIN or second collection needed. The trade-off is that history can't be queried independently, but for this app that's never needed.

### Overdue Detection
Overdue is a computed property that gets written to the database (`isOverdue: true`) rather than calculated on every page load. A helper function (`flagOverdueComplaints`) runs each time the admin opens the complaints list. It does a single `updateMany` — finding all unresolved complaints older than the configured threshold — and flips their flag. This keeps the field filterable and sortable. Once a complaint is Resolved, its `isOverdue` flag is cleared.

### Photo Handling
Multer saves uploaded photos to `public/uploads/complaints/` on disk with a timestamp prefix to avoid filename collisions. The filename is stored in the complaint document. Files are served as static assets by Express (`/uploads/complaints/<filename>`). For production, swap the storage engine for S3 or Cloudinary.

### Notification Flow
Nodemailer is configured with Gmail SMTP. Emails are sent asynchronously with `async/await` wrapped in try/catch, so a failed email never blocks the actual request or surfaces an error to the user. Two triggers: (1) a resident's complaint status changes → one email to that resident; (2) an admin posts an important notice → one email to every resident in the database.

---

## Project Structure
```
society-tracker/
├── app.js                  # Entry point — sets up Express, sessions, routes
├── seed-admin.js           # Run once to create admin account
├── .env.example            # Copy to .env and fill in your values
├── config/
│   ├── db.js               # MongoDB connection
│   └── mailer.js           # Nodemailer setup + sendEmail helper
├── models/
│   ├── User.js             # Resident + Admin schema
│   ├── Complaint.js        # Complaint with embedded history
│   ├── Notice.js           # Notice board entries
│   └── Settings.js         # App-wide config (overdue threshold)
├── middleware/
│   ├── auth.js             # isLoggedIn, isAdmin, isResident guards
│   └── upload.js           # Multer config for photo uploads
├── controllers/
│   ├── authController.js   # Register, login, logout
│   ├── residentController.js
│   └── adminController.js
├── routes/
│   ├── auth.js
│   ├── resident.js
│   └── admin.js
├── views/
│   ├── partials/           # header, footer, navbar, flash
│   ├── auth/               # login, register
│   ├── resident/           # complaints list, new, detail, notices
│   └── admin/              # dashboard, complaints, detail, notices, settings
└── public/
    ├── css/style.css       # All styles + dark/light mode
    ├── js/theme.js         # Dark/light toggle
    └── uploads/complaints/ # Uploaded photos (auto-created)
```
