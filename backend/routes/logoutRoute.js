const express = require('express');
const router = express.Router();

router.post('/logout', async(req, res) => {
    try {
        // Clear the session
        req.session.destroy((err) => {
            if(err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Logout failed' });
            }
            
            // Clear the session cookie
            res.clearCookie('connect.sid', {
                path: '/',
                httpOnly: true,
                secure: false,
                sameSite: 'lax'
            });
            
            res.status(200).json({ message: 'Logout Success' });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
});

module.exports = router;

