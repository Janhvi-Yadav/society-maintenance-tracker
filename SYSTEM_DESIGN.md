# System Design 

## Overview

The Society Maintenance Tracker is a full-stack web application developed to simplify maintenance management within residential societies. The system follows the MVC (Model-View-Controller) architecture using Express.js and MongoDB Atlas. Residents can raise complaints and track their progress, while administrators manage complaints, publish notices, and configure application settings.

---

## Architecture

The application consists of four major layers:

### Presentation Layer

The user interface is developed using EJS templates, HTML, CSS, and JavaScript. Separate dashboards are provided for residents and administrators. Responsive layouts ensure usability across desktop and mobile devices.

### Application Layer

Express.js handles routing and business logic. Controllers process user requests, perform validation, interact with MongoDB, and return rendered views.

### Data Layer

MongoDB Atlas stores application data using Mongoose models.

Collections:

- Users
- Complaints
- Notices
- Settings

---

## Authentication & Authorization

Authentication is implemented using Express Session.

Passwords are securely hashed using bcrypt before storage.

Role-based authorization restricts access:

- Residents can only access their own complaints.
- Administrators can manage all complaints and notices.

Middleware protects all restricted routes.

---

## Complaint History Model

Each complaint contains an embedded history array that records every status update.

Each history entry stores:

- Status
- Changed By
- Timestamp
- Optional Note

Embedding history within the Complaint document avoids additional database queries while providing a complete audit trail whenever a complaint is viewed.

This design is efficient because complaint history is always retrieved together with the complaint itself.

---

## Overdue Detection

The application identifies unresolved complaints that exceed a configurable threshold.

Administrators define the threshold in the Settings page.

Whenever the complaint dashboard loads, the application executes a single MongoDB update operation that marks eligible complaints as overdue.

This approach provides:

- Fast filtering
- Efficient sorting
- Reduced runtime computation

Resolved complaints automatically clear the overdue flag.

---

## Photo Handling

Residents may upload images while creating complaints.

Multer processes uploaded files and stores them in the uploads directory. The generated filename is stored in MongoDB.

The application serves uploaded images as static assets.

For cloud deployment, the storage mechanism can easily be replaced with Cloudinary without changing application logic.

---

## Notification Flow

The application integrates Nodemailer with Gmail SMTP.

Emails are sent asynchronously to prevent request delays.

Notifications are triggered when:

1. An administrator changes the status of a complaint.
2. An administrator publishes an important notice.

Failures in email delivery are logged without interrupting normal application functionality.

---

## Database Design

### User

Stores resident and administrator information.

### Complaint

Stores complaint details, uploaded image path, priority, status, overdue flag, and embedded history.

### Notice

Stores society announcements and important notices.

### Settings

Stores configurable application settings such as overdue threshold.

---

## Security

The application implements several security measures:

- Password hashing using bcrypt
- Session-based authentication
- Protected routes using middleware
- Environment variables for sensitive credentials
- Server-side validation

---

## Scalability

The application is designed for small to medium-sized residential societies.

Possible future enhancements include:

- Cloudinary storage
- JWT authentication
- Real-time notifications using Socket.IO
- Payment gateway integration
- REST API
- Mobile application

---

## Conclusion

The Society Maintenance Tracker demonstrates a modular and scalable MVC architecture with secure authentication, complaint lifecycle management, embedded history tracking, configurable overdue detection, email notifications, and role-based access control. The design emphasizes maintainability, simplicity, and practical deployment while remaining extensible for future enhancements.