const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendContactEmail = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const {
      bike_name,
      bikeImage,
      listedBy,
      userDetails,
      message
    } = req.body;
    // console.log(userDetails);

    if (!listedBy?.email || !userDetails?.email) {
      return res.status(400).json({ message: 'Emails are required' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,         // your email
        pass: process.env.EMAIL_PASS        // app password (not your Gmail password)
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: listedBy.email,
      subject: `Interest in your bike: ${bike_name}`,
      html: `
        <h3>Someone is interested in your bike listing.</h3>
        <p><strong>Bike:</strong> ${bike_name}</p>
        <img src="${bikeImage}" alt="Bike Image" width="300" />
        <p><strong>Message:</strong> ${message}</p>
        <hr />
        <h4>Interested User Details:</h4>
        <p><strong>Name:</strong> ${userDetails.fullName}</p>
        <p><strong>Email:</strong> ${userDetails.email}</p>
        <p><strong>Address:</strong> ${userDetails.address}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully' });

  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
