const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const otpStore = new Map();
const userStore = new Map();

function getTransporter(customUser, customPass) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = customUser || process.env.SMTP_USER || '';
  const pass = (customPass || process.env.SMTP_PASS || '').replace(/\s+/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

app.post('/api/send-otp', async (req, res) => {
  const { email, app_password, otp: clientOtp } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Invalid email address' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const otp = clientOtp || Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(cleanEmail, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  const fromEmail = process.env.FROM_EMAIL || cleanEmail;
  const fromName = process.env.FROM_NAME || 'EnterpriseBuilder Security';

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .title { font-size: 20px; font-weight: 700; color: #1e1b4b; margin: 0 0 16px; }
        .otp-box { background: #f3f0ff; border: 2px dashed #6366f1; border-radius: 12px; text-align: center; padding: 20px; margin: 24px 0; }
        .otp-code { font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; }
        .hint { font-size: 14px; color: #64748b; line-height: 1.6; }
        .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2 class="title">EnterpriseBuilder Verification</h2>
        <p class="hint">Hello,</p>
        <p class="hint">Please use the following 6-digit verification code to complete your authentication:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p class="hint">This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.</p>
        <div class="footer">Sent securely by EnterpriseBuilder Security</div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = getTransporter(cleanEmail, app_password);
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: cleanEmail,
      subject: `EnterpriseBuilder Verification Code: ${otp}`,
      text: `Your verification code is: ${otp}\nValid for 10 minutes.`,
      html: htmlBody
    });

    res.json({ success: true, message: 'OTP sent successfully via Node.js Mailer' });
  } catch (error) {
    res.json({
      success: true,
      otp,
      warning: 'SMTP dispatch skipped or unconfigured. In-memory OTP active.',
      error: error.message
    });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = otp.toString().trim();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return res.json({ success: false, error: 'No active verification code found' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return res.json({ success: false, error: 'Verification code has expired' });
  }

  if (record.otp !== cleanOtp) {
    return res.json({ success: false, error: 'Incorrect verification code' });
  }

  otpStore.delete(cleanEmail);

  let user = userStore.get(cleanEmail);
  if (!user) {
    const name = cleanEmail.split('@')[0];
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    user = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      name: formattedName,
      role: 'Verified Google User',
      plan: 'free',
      planName: 'Free Edition (Limited)',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=4f46e5&color=fff`,
      createdAt: new Date().toISOString()
    };
    userStore.set(cleanEmail, user);
  }

  res.json({ success: true, user });
});

app.post('/api/payment', (req, res) => {
  const { email, plan, method } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();
  let user = userStore.get(cleanEmail) || {
    id: 'usr_' + Math.random().toString(36).substr(2, 9),
    email: cleanEmail,
    name: cleanEmail.split('@')[0] || 'User'
  };

  const targetPlan = plan === 'enterprise' ? 'enterprise' : (plan === 'pro' ? 'pro' : 'free');
  user.plan = targetPlan;
  user.planName = targetPlan === 'enterprise' ? 'Enterprise Edition' : (targetPlan === 'pro' ? 'Pro Edition' : 'Free Edition (Limited)');
  userStore.set(cleanEmail, user);

  res.json({
    success: true,
    user,
    transaction: {
      transaction_id: 'TXN_' + Date.now(),
      receipt_number: 'REC-' + Math.floor(100000 + Math.random() * 900000),
      plan: targetPlan,
      amount: targetPlan === 'enterprise' ? 3999.00 : (targetPlan === 'pro' ? 1499.00 : 0),
      currency: 'INR',
      method: method || 'online',
      payment_date: new Date().toISOString()
    }
  });
});

app.listen(PORT, () => {
  console.log(`EnterpriseBuilder Node.js server running on http://localhost:${PORT}`);
});
