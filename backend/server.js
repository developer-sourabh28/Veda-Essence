const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const nodemailer = require('nodemailer');
const User = require('./routes/UserRoute');
const Post = require('./routes/PostRoute');
const Permission = require('./routes/permissionRoute');
const cors = require('cors');
const path = require('path');
const cart = require('./routes/cartRoute');
const logout = require('./routes/logoutRoute')
const Card = require('./routes/cardRoute');
const Rating = require('./routes/ratingRoute');
const Review = require('./routes/reviewRoute');
const paypal = require('@paypal/checkout-server-sdk');
const addressRoute = require('./routes/addressRoute');
const orderRoute = require('./routes/orderRoute');

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Enable CORS first
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax'
    }
}));

const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_SECRET
  );
  const client = new paypal.core.PayPalHttpClient(environment);

  app.post('/create-order', async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '10.00'
        }
      }]
    });
  
    try {
      const order = await client.execute(request);
      res.json({ id: order.result.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bansotiyas@gmail.com',
        pass: 'pqlw fykm iads lxfy'
    }
});

// Reusable email function
const sendEmail = async (to, subject, body) => {
    try {
        console.log('Attempting to send email to:', to);
        const mailOptions = {
            from: 'bansotiyas@gmail.com',
            to: to,
            subject: subject,
            html: body
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Make sendEmail available globally
global.sendEmail = sendEmail;

app.post('/api/send-email', async (req, res) => {
  const { to, subject, body, isHtml } = req.body;
  
  try {
    // Configure your email service (Gmail, SendGrid, etc.)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'bansotiyas@gmail.com',
        pass: 'pqlw fykm iads lxfy' // Consider using environment variables for security
      }
    });

    await transporter.sendMail({
      from: 'bansotiyas@gmail.com',
      to: to,
      subject: subject,
      html: body // Use html instead of text to properly render HTML content
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.json({ success: false, message: error.message });
  }
});

// Serve the 'uploads' folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((err) => console.log(err));

// Mount routes
app.use('/', User);
app.use('/', Post);
app.use('/permission', Permission);
app.use('/api', cart);
app.use('/api', logout);
app.use('/', Card);
app.use('/', Rating);
app.use('/', Review);
app.use('/api', addressRoute);
app.use('/api', orderRoute);

app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
});
