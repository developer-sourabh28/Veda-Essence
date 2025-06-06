const express = require('express');
const router = express.Router();
const Address = require('../schemas/addressSchema');
const { verifyToken } = require('../middleware/auth');

// Add new address
router.post('/address/add', verifyToken, async (req, res) => {
    try {
        const { userId, fullName, streetAddress, city, state, postalCode, phoneNumber } = req.body;

        if (!userId || !fullName || !streetAddress || !city || !state || !postalCode || !phoneNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newAddress = new Address({
            userId,
            fullName,
            streetAddress,
            city,
            state,
            postalCode,
            phoneNumber
        });

        await newAddress.save();
        res.status(201).json({ message: 'Address added successfully', address: newAddress });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all addresses for a user
router.get('/address/:userId', verifyToken, async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.params.userId });
        res.status(200).json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete an address
router.delete('/address/:id', verifyToken, async (req, res) => {
    try {
        const deletedAddress = await Address.findByIdAndDelete(req.params.id);
        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Set default address
router.put('/address/default/:id', verifyToken, async (req, res) => {
    try {
        // First, set all addresses to non-default
        await Address.updateMany(
            { userId: req.body.userId },
            { isDefault: false }
        );

        // Then set the selected address as default
        const updatedAddress = await Address.findByIdAndUpdate(
            req.params.id,
            { isDefault: true },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Default address updated successfully', address: updatedAddress });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 