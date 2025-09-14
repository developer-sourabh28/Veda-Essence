const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const paypal = require('@paypal/checkout-server-sdk');

// Import routes
const User = require('./routes/UserRoute');
const Post = require('./routes/PostRoute');
const Permission = require('./routes/permissionRoute');
const cart = require('./routes/cartRoute');
const logout = require('./routes/logoutRoute');
const Card = require('./routes/cardRoute');
const Rating = require('./routes/ratingRoute');
const Review = require('./routes/reviewRoute');
const addressRoute = require('./routes/addressRoute');
const orderRoute = require('./routes/orderRoute');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ CORS setup (local + production)
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL // e.g. https://yourapp.onrender.com
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// ✅ Session
app.use(session({
  secret: process.env.SECRET_KEY || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'lax'
  }
}));

// ✅ PayPal
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
    purchase_units: [{ amount: { currency_code: 'USD', value: '10.00' } }]
  });

  try {
    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Nodemailer (env vars instead of hardcoding!)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

global.sendEmail = async (to, subject, body) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: body
    });
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// ✅ Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// ✅ Routes
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

// ✅ Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
