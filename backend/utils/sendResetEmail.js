const nodemailer = require("nodemailer");

const sendResetEmail = async (email, resetLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `
        <h2>Password Reset</h2>
        <p>Click below:</p>
        <a href="${resetLink}">Reset Password</a>
      `
    });

    // console.log("EMAIL SENT ✔");

  } catch (error) {
    console.log("EMAIL ERROR ", error);
  }
};

module.exports = sendResetEmail;