
const nodemailer = require('nodemailer');

// Create a reusable transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address (set in .env)
    pass: process.env.GMAIL_PASS  // App password (set in .env)
  }
});

/**
 * Send a booking confirmation email (AirTaxi or Flight)
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content for the email
 * @returns {Promise}
 */
async function sendBookingConfirmation(to, subject, html) {
  return transporter.sendMail({
    from: `AeroX Booking <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html
  });
}

module.exports = {
  sendBookingConfirmation
};
