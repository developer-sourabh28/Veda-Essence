const express = require('express');
const User = require('../schemas/UserSchema');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../server');

router.post('/signup', async(req, res) => {
    try {
        const newUser = new User({
            name : req.body.name,
            email : req.body.email,
            password : req.body.password,
        })

        const savedUser = await newUser.save();
        
        // Send welcome email
        const welcomeEmailBody = `
            <h1>Welcome to Our Platform!</h1>
            <p>Dear ${savedUser.name},</p>
           <p>Thank you for signing up with Veda Essencee — where every scent tells a story. We're thrilled to have you join our fragrance journey!</p>
<p>Warm regards,<br>Team Veda Essencee</p>

        `;
        
        await sendEmail(savedUser.email, 'Welcome to Our Platform!', welcomeEmailBody);
        
        res.status(200).json({message : 'User Signup success!'})
    } catch (error) {
        res.status(500).json({message : error.message})
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email
        const loginUser = await User.findOne({ email });

        if (!loginUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, loginUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: loginUser._id,
                username: loginUser.name,
                role: loginUser.role
            },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Send login notification email
        const loginEmailBody = `
            <h1>Login Notification</h1>
            <p>Dear ${loginUser.name},</p>
            <p>You have successfully logged into your account.</p>
             <p>Thank you for signing up with Veda Essencee — where every scent tells a story. We're thrilled to have you join our fragrance journey!</p>
<p>Warm regards,<br>Team Veda Essencee</p>
        `;
        
        try {
            console.log('Sending login notification email to:', loginUser.email);
            const emailSent = await global.sendEmail(loginUser.email, 'Login Notification', loginEmailBody);
            if (!emailSent) {
                console.error('Failed to send login notification email');
            }
        } catch (emailError) {
            console.error('Error sending login email:', emailError);
            // Don't fail the login if email fails
        }

        // Send back user data and token
        res.status(200).json({
            token,
            user: {
                id: loginUser._id,
                name: loginUser.name,
                email: loginUser.email,
                role: loginUser.role
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

module.exports = router;