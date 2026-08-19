const nodemailer = require("nodemailer");

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("SMTP configuration is missing in .env. Email notifications will be printed to server console/logs.");
    return {
      sendMail: async (options) => {
        console.log("=========================================");
        printMockEmail(options);
        console.log("=========================================");
        return { messageId: "mock-message-id" };
      }
    };
  }

  // Use Nodemailer's built-in gmail service configuration for Gmail hosts
  if (host.toLowerCase().includes("gmail")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  const portNum = parseInt(port || "465", 10);
  return nodemailer.createTransport({
    host,
    port: portNum,
    secure: portNum === 465,
    auth: {
      user,
      pass,
    },
  });
};

const printMockEmail = (options) => {
  console.log(`[EMAIL SEND SIMULATION]`);
  console.log(`From: ${options.from || "system@lostandfound.com"}`);
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body (HTML):\n${options.html}`);
};

const sendOwnerNotification = async (ownerEmail, ownerName, lostItemTitle, foundItemTitle) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Lost & Found Portal" <${process.env.SMTP_USER || "no-reply@lostandfound.com"}>`,
    to: ownerEmail,
    subject: "🎯 AI Match Found for your Lost Item!",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1e293b;">
          <img src="https://cdn-icons-png.flaticon.com/512/6195/6195699.png" alt="Lost & Found" style="width: 70px; height: 70px; margin-bottom: 10px;" />
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lost & Found</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">AI Match Notification System</p>
        </div>

        <div style="padding: 24px 0;">
          <p style="font-size: 16px; margin: 0 0 16px 0; color: #f1f5f9;">Dear <strong>${ownerName}</strong> 👋,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">Great news! Our AI matching system identified a high-confidence match for your reported lost item!</p>
          
          <div style="background: rgba(30, 41, 59, 0.7); padding: 18px; border-radius: 12px; border-left: 4px solid #818cf8; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #f8fafc;">📦 <strong>Your Lost Item:</strong> ${lostItemTitle}</p>
            <p style="margin: 0 0 14px 0; font-size: 14px; color: #38bdf8;">✨ <strong>Matched Found Item:</strong> ${foundItemTitle}</p>
            
            <div style="border-top: 1px solid #334155; padding-top: 12px; margin-top: 12px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #f8fafc;">📋 Instructions to claim your item:</p>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #cbd5e1; line-height: 1.8;">
                <li>Login into the account</li>
                <li>Go to dashboard match section and claim it</li>
              </ol>
            </div>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Follow the instructions above to submit your claim. Once claimed, our administration team will verify and finalize the handover.</p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">This is an automated notification from the Lost & Found Portal.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email notification successfully sent to ${ownerEmail} (MsgID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error("Failed to send email notification to owner:", err.message);
    return false;
  }
};

const sendPasswordResetOTP = async (userEmail, userName, otpCode) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Lost & Found Portal" <${process.env.SMTP_USER || "no-reply@lostandfound.com"}>`,
    to: userEmail,
    subject: `🔑 ${otpCode} is your Lost & Found Password Reset Code`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px; background: #0f172a; color: #f8fafc; border-radius: 20px; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        
        <!-- Header Banner -->
        <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <img src="https://cdn-icons-png.flaticon.com/512/6195/6195699.png" alt="Lost & Found" style="width: 80px; height: 80px; margin-bottom: 12px; filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));" />
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Lost & Found</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; font-weight: 500;">Security & Account Recovery</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 28px 0; text-align: center;">
          <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 0 0 12px 0;">Password Reset Request 🔑</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0; max-width: 440px; margin-left: auto; margin-right: auto;">
            Hello <strong style="color: #f8fafc;">${userName || "User"}</strong>! We received a request to reset your password. Use your 6-digit verification code below:
          </p>

          <!-- OTP Badge -->
          <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(129, 140, 248, 0.15)); border: 2px dashed #38bdf8; padding: 20px; border-radius: 16px; display: inline-block; margin: 0 auto 24px auto; min-width: 240px;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; display: block; text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);">
              ${otpCode}
            </span>
          </div>

          <!-- Validity Notice -->
          <div style="display: inline-flex; items-center; justify-content: center; gap: 8px; background: rgba(30, 41, 59, 0.8); padding: 8px 16px; border-radius: 20px; border: 1px solid #334155; margin-bottom: 20px;">
            <span style="font-size: 13px; color: #cbd5e1;">⏱️ Valid for <strong>15 minutes</strong></span>
          </div>

          <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 12px; color: #64748b;">
          <p style="margin: 0 0 4px 0;">🔒 Automated security email from <strong>Lost & Found Portal</strong></p>
          <p style="margin: 0;">&copy; 2026 Lost & Found. All rights reserved.</p>
        </div>

      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP email sent to ${userEmail} (MsgID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error("Failed to send OTP email:", err.message);
    return false;
  }
};

const sendHandoverSuccessNotification = async (userEmail, userName, lostItemTitle, foundItemTitle) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Lost & Found Portal" <${process.env.SMTP_USER || "no-reply@lostandfound.com"}>`,
    to: userEmail,
    subject: "🎉 Item Handover Confirmed & Successfully Completed!",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background: #0f172a; color: #f8fafc; border-radius: 20px; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        
        <!-- Header Banner -->
        <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <img src="https://cdn-icons-png.flaticon.com/512/6195/6195699.png" alt="Lost & Found" style="width: 80px; height: 80px; margin-bottom: 12px; filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));" />
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; background: linear-gradient(135deg, #004b87, #0284c7, #16a34a); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lost & Found Portal</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; font-weight: 500;">Official Handover Confirmation</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 28px 0; text-align: center;">
          <div style="background: rgba(22, 163, 74, 0.15); border: 1px solid rgba(22, 163, 74, 0.4); padding: 12px 20px; border-radius: 30px; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px;">
            <span style="font-size: 14px; font-weight: 700; color: #4ade80;">✅ Handover Verified & Completed!</span>
          </div>

          <h2 style="font-size: 22px; font-weight: 800; color: #f8fafc; margin: 0 0 12px 0;">Item Handover Confirmed 🎉</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0; max-width: 480px; margin-left: auto; margin-right: auto;">
            Dear <strong style="color: #f8fafc;">${userName || "User"}</strong> 👋, campus administration has officially verified ownership and confirmed the successful handover of your item!
          </p>

          <!-- Item Details Box -->
          <div style="background: rgba(30, 41, 59, 0.8); padding: 20px; border-radius: 16px; border: 1px solid #334155; text-align: left; margin-bottom: 24px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #f8fafc;">📦 <strong>Lost Item:</strong> <span style="color: #38bdf8; font-weight: 700;">${lostItemTitle}</span></p>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #f8fafc;">🔍 <strong>Matched Found Item:</strong> <span style="color: #4ade80; font-weight: 700;">${foundItemTitle}</span></p>
            <p style="margin: 0; font-size: 13px; color: #94a3b8;">✨ Status: <strong style="color: #4ade80;">Resolved & Returned to Owner</strong></p>
          </div>

          <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1; margin: 0;">
            Thank you for using the Lost & Found Portal to help reunite lost belongings on campus!
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 12px; color: #64748b;">
          <p style="margin: 0 0 4px 0;">🎓 Official notification from <strong>Lost & Found Portal</strong></p>
          <p style="margin: 0;">&copy; 2026 Lost & Found System. All rights reserved.</p>
        </div>

      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Handover success email sent to ${userEmail} (MsgID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error("Failed to send handover success email:", err.message);
    return false;
  }
};

module.exports = {
  sendOwnerNotification,
  sendPasswordResetOTP,
  sendHandoverSuccessNotification,
};
