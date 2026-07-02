const nodemailer = require('nodemailer');

// Using Gmail's free SMTP service. To make this work:
// 1. Use a Gmail account
// 2. Turn on 2-Step Verification on that account
// 3. Generate an "App Password" (Google Account > Security > App Passwords)
// 4. Put that app password (NOT your normal Gmail password) in .env as EMAIL_PASS
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generic helper — every other file just calls this with subject + html body.
// We wrap it in try/catch and never throw, so a failed email never crashes
// the actual feature (e.g. updating a complaint status should still work
// even if, say, the resident's email bounces).
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Society Maintenance" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error('Email failed to send:', err.message);
  }
}

module.exports = sendEmail;
