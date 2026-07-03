# 🏢 Society Maintenance Tracker

A full-stack web application that streamlines maintenance management in residential societies. Residents can raise maintenance complaints, upload supporting images, track complaint status, and view society notices, while administrators manage complaints, prioritize issues, publish notices, and monitor system activity through an interactive dashboard.

---

## 🌐 Live Demo

**Application:** https://society-maintenance-tracker-w7g0.onrender.com


---

## 🚀 Features

### Resident
- Register and login securely
- Raise maintenance complaints
- Upload complaint images
- Track complaint status
- View complaint history
- Access society notices

### Admin
- Interactive dashboard
- Manage complaints
- Assign priority
- Update complaint status
- Automatic overdue detection
- Publish notices
- Send email notifications
- Configure overdue threshold

---

## 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | HTML, CSS, JavaScript, EJS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | Express Session + bcryptjs |
| Email | Nodemailer |
| File Upload | Multer |
| Deployment | Render |
| Version Control | Git & GitHub |

---

## 📂 Project Structure

```text
society-maintenance-tracker
│
├── config
├── controllers
├── middleware
├── models
├── public
├── routes
├── views
├── app.js
├── package.json
└── README.md
```

---

## ⚙ Installation

### Clone Repository

```bash
git clone https://github.com/Janhvi-Yadav/society-maintenance-tracker.git

cd society-maintenance-tracker
```

### Install Dependencies

```bash
npm install
```

### Create `.env`

```env
MONGO_URI=
SESSION_SECRET=
EMAIL_USER=
EMAIL_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Seed Admin

```bash
node seed-admin.js
```

Default Admin Credentials

```
Email:
admin@society.com

Password:
admin123
```

### Start Project

```bash
npm start
```

Development

```bash
npm run dev
```

---

## 👥 User Roles

| Feature | Resident | Admin |
|---------|:--------:|:----:|
| Register/Login | ✅ | ✅ |
| Raise Complaint | ✅ | ❌ |
| Upload Images | ✅ | ❌ |
| View Own Complaints | ✅ | ❌ |
| View All Complaints | ❌ | ✅ |
| Update Status | ❌ | ✅ |
| Dashboard | ❌ | ✅ |
| Notice Board | ✅ | ✅ |

---

## 📧 Email Notifications

Residents receive email notifications whenever:

- Complaint status changes
- Important notices are published

---

## 📚 Documentation

- API Routes
- Database Schema
- System Design

See **SYSTEM_DESIGN.md**

---

## 📄 License

MIT License

---

## 👩‍💻 Author

**Janhvi Yadav**

GitHub: https://github.com/Janhvi-Yadav