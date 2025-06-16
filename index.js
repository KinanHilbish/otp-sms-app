require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const app = express();
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send OTP
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({ to: phone, channel: 'sms' });

    res.status(200).json({ message: 'OTP sent', sid: verification.sid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;
  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: phone, code });

    if (verificationCheck.status === 'approved') {
      res.status(200).json({ message: 'Verification successful' });
    } else {
      res.status(400).json({ message: 'Invalid code' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running...');
});
