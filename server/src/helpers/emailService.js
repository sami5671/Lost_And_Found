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

  return nodemailer.createTransport({
    host,
    port: parseInt(port || "587"),
    secure: port === "465",
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
    from: `"DIU Lost & Found Portal" <${process.env.SMTP_USER || "no-reply@diu.edu"}>`,
    to: ownerEmail,
    subject: "🎯 AI Match Found for your Lost Item!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #0a0e27; color: #f0f0f8; color-scheme: dark;">
        <h2 style="color: #a855f7; border-bottom: 2px solid rgba(168, 85, 247, 0.2); padding-bottom: 10px;">DIU Lost & Found Notification</h2>
        <p>Dear <strong>${ownerName}</strong>,</p>
        <p>We are pleased to inform you that our AI system has identified a potential match for the item you reported lost!</p>
        
        <div style="background-color: rgba(255,255,255,0.05); padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #a855f7;">
          <p style="margin: 5px 0;"><strong>Your Lost Item:</strong> ${lostItemTitle}</p>
          <p style="margin: 5px 0;"><strong>Matched Found Item:</strong> ${foundItemTitle}</p>
        </div>
        
        <p>An administrator has verified this match. Please visit the Daffodil International University Lost & Found office or log into your portal dashboard to claim your item.</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: rgba(240,240,248,0.5);">This is an automated notification. Please do not reply to this email.</p>
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

module.exports = {
  sendOwnerNotification,
};
