/**
 * Email Service
 * Uses Nodemailer to send OTP and notification emails.
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send OTP email to student
 */
async function sendOtpEmail(to, otp) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0A0E1A; margin: 0; padding: 20px; }
        .container { max-width: 480px; margin: 0 auto; background: #111827; border-radius: 16px; border: 1px solid #1e2d45; overflow: hidden; }
        .header { background: linear-gradient(135deg, #0d1830, #1a2235); padding: 32px; text-align: center; }
        .logo { font-size: 24px; font-weight: 800; color: #F0F4FF; }
        .logo span { color: #4F8EF7; }
        .body { padding: 32px; }
        .otp-box { background: #1a2235; border: 2px solid #4F8EF7; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #4F8EF7; font-family: monospace; }
        .text { color: #9CA3AF; font-size: 14px; line-height: 1.6; }
        .expires { color: #F59E0B; font-weight: 600; }
        .footer { background: #0d1217; padding: 20px 32px; text-align: center; color: #374151; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Campus<span>Connect</span></div>
        </div>
        <div class="body">
          <p class="text" style="color:#F0F4FF; font-size:18px; font-weight:700; margin-bottom:8px;">Verify your email</p>
          <p class="text">Your one-time password for CampusConnect login:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="text">This OTP is valid for <span class="expires">10 minutes</span>. Do not share it with anyone.</p>
          <p class="text" style="margin-top:16px; font-size:12px; color:#6B7280;">If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">CampusConnect · Secure College Marketplace</div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"CampusConnect" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: `${otp} is your CampusConnect OTP`,
      html,
    });
  } catch (err) {
    console.error('[Email] Failed to send OTP:', err.message);
    // Don't throw — in dev we just log; won't block the flow
  }
}

/**
 * Send approval email to admin when their college gets approved
 */
async function sendApprovalEmail(to, adminName, collegeName) {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#111827;border-radius:16px;border:1px solid #1e2d45;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0d1830,#1a2235);padding:32px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:#F0F4FF;">Campus<span style="color:#10B981;">Connect</span></div>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#F0F4FF;margin-bottom:12px;">🎉 Registration Approved!</h2>
        <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">Hi ${adminName},</p>
        <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">
          Your college <strong style="color:#10B981;">${collegeName}</strong> has been approved on CampusConnect. 
          You can now log in to your admin dashboard and start managing your college marketplace.
        </p>
        <a href="${process.env.FRONTEND_URL}/admin/login" 
           style="display:inline-block;margin-top:24px;background:#10B981;color:#003824;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:14px;">
          Go to Admin Login →
        </a>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"CampusConnect" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: `✅ Your college "${collegeName}" has been approved`,
      html,
    });
  } catch (err) {
    console.error('[Email] Failed to send approval email:', err.message);
  }
}

/**
 * Notify master admin of new college registration request
 */
async function notifyMasterAdminRegistration(collegeName, adminName, adminEmail) {
  try {
    await transporter.sendMail({
      from: `"CampusConnect System" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: process.env.MASTER_EMAIL,
      subject: `New College Registration: ${collegeName}`,
      html: `
        <div style="font-family:sans-serif;padding:24px;background:#111827;color:#F0F4FF;border-radius:12px;">
          <h2>New Registration Request</h2>
          <p><strong>College:</strong> ${collegeName}</p>
          <p><strong>Admin:</strong> ${adminName} (${adminEmail})</p>
          <a href="${process.env.FRONTEND_URL}/master/requests" style="background:#F7C948;color:#0A0E1A;padding:10px 20px;border-radius:9999px;text-decoration:none;font-weight:700;">
            Review in Master Panel →
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Email] Failed to notify master admin:', err.message);
  }
}

/**
 * Notify college admin when a new student registers and awaits approval
 */
async function notifyCollegeAdminOfStudentRequest(adminEmail, adminName, studentName, studentEmail, collegeName) {
  try {
    await transporter.sendMail({
      from: `"CampusConnect" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Student Registration Request — ${collegeName}`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#111827;border-radius:16px;border:1px solid #1e2d45;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0d1830,#1a2235);padding:32px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:#F0F4FF;">Campus<span style="color:#10B981;">Connect</span></div>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#F0F4FF;margin-bottom:12px;">📋 New Student Request</h2>
            <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">Hi ${adminName},</p>
            <p style="color:#9CA3AF;font-size:14px;line-height:1.6;">
              A new student has registered for <strong style="color:#10B981;">${collegeName}</strong> and is awaiting your approval.
            </p>
            <div style="background:#1a2235;border:1px solid #1e2d45;border-radius:10px;padding:16px;margin:20px 0;">
              <p style="color:#9CA3AF;font-size:13px;margin-bottom:6px;"><strong style="color:#F0F4FF;">Name:</strong> ${studentName}</p>
              <p style="color:#9CA3AF;font-size:13px;margin:0;"><strong style="color:#F0F4FF;">Email:</strong> ${studentEmail}</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/admin/requests"
               style="display:inline-block;margin-top:8px;background:#10B981;color:#003824;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:14px;">
              Review Request in Admin Panel →
            </a>
          </div>
          <div style="background:#0d1217;padding:20px 32px;text-align:center;color:#374151;font-size:12px;">
            CampusConnect · Secure College Marketplace
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Email] Failed to notify college admin of student request:', err.message);
  }
}

module.exports = { sendOtpEmail, sendApprovalEmail, notifyMasterAdminRegistration, notifyCollegeAdminOfStudentRequest };

