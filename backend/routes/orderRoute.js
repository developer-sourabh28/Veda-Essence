const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const sendWhatsappMessage = require('../utils/sendWhatsapp');

router.post('/place-order', verifyToken, async (req, res) => {
    try {
        const { 
            userId, 
            items, 
            totalAmount, 
            address,
            phoneNumber 
        } = req.body;

        console.log('Received order request with data:', {
            userId,
            items,
            totalAmount,
            address,
            phoneNumber
        });

        // Validate phone number
        if (!phoneNumber) {
            console.error('Phone number is missing');
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number is required for WhatsApp notifications' 
            });
        }

        // Format phone number to ensure it has country code
        let formattedPhone = phoneNumber;
        if (!phoneNumber.startsWith('+')) {
            formattedPhone = `+91${phoneNumber}`; // Assuming Indian numbers, adjust as needed
        }

        console.log('Formatted phone number:', formattedPhone);

        // Format the order details for the WhatsApp message
        const orderItems = items.map(item => 
            `- ${item.itemName} (${item.itemSize}) - $${item.itemPrice}`
        ).join('\n');

        const message = `
🎉 Order Placed Successfully! 🎉

Your order has been confirmed.

Order Details:
${orderItems}

Total Amount: $${totalAmount}

Delivery Address:
${address.fullName}
${address.streetAddress}
${address.city}, ${address.state} ${address.postalCode}

Thank you for shopping with us! 🙏
        `;

        console.log('Attempting to send WhatsApp message with content:', message);

        // Send WhatsApp message
        const whatsappSent = await sendWhatsappMessage(formattedPhone, message);

        if (whatsappSent) {
            console.log('WhatsApp message sent successfully');
            res.status(200).json({ 
                success: true, 
                message: 'Order placed successfully and WhatsApp notification sent' 
            });
        } else {
            console.error('Failed to send WhatsApp message');
            res.status(200).json({ 
                success: true, 
                message: 'Order placed successfully but WhatsApp notification failed. Please check your phone number format.' 
            });
        }
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error placing order: ' + error.message 
        });
    }
});

module.exports = router; 