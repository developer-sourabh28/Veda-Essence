const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER; // Your Twilio WhatsApp number

// Validate environment variables
if (!accountSid || !authToken || !whatsappFrom) {
    console.error('Missing Twilio credentials in environment variables');
    console.error('Required variables:');
    console.error('- TWILIO_ACCOUNT_SID:', accountSid ? 'Set' : 'Missing');
    console.error('- TWILIO_AUTH_TOKEN:', authToken ? 'Set' : 'Missing');
    console.error('- TWILIO_WHATSAPP_NUMBER:', whatsappFrom ? 'Set' : 'Missing');
    throw new Error('Missing required Twilio credentials');
}

console.log('Twilio credentials loaded:');
console.log('- Account SID:', accountSid ? 'Present' : 'Missing');
console.log('- Auth Token:', authToken ? 'Present' : 'Missing');
console.log('- WhatsApp Number:', whatsappFrom);

const client = twilio(accountSid, authToken);

async function sendWhatsappMessage(to, message) {
    try {
        console.log('Initializing WhatsApp message send...');
        console.log('From:', whatsappFrom);
        console.log('To:', to);
        
        if (!to.startsWith('+')) {
            throw new Error('Phone number must start with + and include country code');
        }

        if (!whatsappFrom.startsWith('+')) {
            throw new Error('Twilio WhatsApp number must start with + and include country code');
        }

        const response = await client.messages.create({
            from: `whatsapp:${whatsappFrom}`,
            to: `whatsapp:${to}`,
            body: message
        });
        
        console.log('WhatsApp message sent successfully:');
        console.log('- Message SID:', response.sid);
        console.log('- Status:', response.status);
        return true;
    } catch (error) {
        console.error('Error sending WhatsApp message:');
        console.error('- Error code:', error.code);
        console.error('- Error message:', error.message);
        console.error('- More info:', error.moreInfo);
        
        // Check for common errors
        if (error.code === 21211) {
            console.error('Invalid phone number format. Must include country code (e.g., +91)');
        } else if (error.code === 21214) {
            console.error('Phone number is not a valid WhatsApp number');
        } else if (error.code === 21215) {
            console.error('Phone number is not verified in Twilio sandbox');
        }
        
        return false;
    }
}

module.exports = sendWhatsappMessage; 