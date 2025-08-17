const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendTaskAssignmentEmail = async (userEmail, taskTitle, projectName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'New Task Assigned',
    html: `
      <h3>You've been assigned a new task!</h3>
      <p><strong>Task:</strong> ${taskTitle}</p>
      <p><strong>Project:</strong> ${projectName}</p>
      <p>Log in to your dashboard to view details.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

const sendStatusUpdateEmail = async (userEmail, taskTitle, newStatus) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Task Status Updated',
    html: `
      <h3>Task status has been updated</h3>
      <p><strong>Task:</strong> ${taskTitle}</p>
      <p><strong>New Status:</strong> ${newStatus}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

module.exports = { sendTaskAssignmentEmail, sendStatusUpdateEmail };