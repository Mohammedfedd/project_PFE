// middlewares/sendRefundMail.js
import { createTransport } from "nodemailer";

export const sendRefundMail = async ({ firstName, lastName, email, amount }) => {
  try {
    const transport = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.Gmail,
        pass: process.env.Password,
      },
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Refund Processed</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      padding: 30px;
      max-width: 600px;
      margin: auto;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h2 {
      color: #f44336;
    }
    p {
      font-size: 15px;
      margin: 10px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hi ${firstName} ${lastName},</h2>
    <p>Your refund of <strong>${amount / 100} MAD</strong> has been successfully processed.</p>
    <p>The amount should reflect in your original payment method within 5–7 business days.</p>
    <p>If you have any questions, just reply to this email or contact our support team.</p>
    <p class="footer">— The YourApp Team</p>
  </div>
</body>
</html>`;

    await transport.sendMail({
      from: process.env.Gmail,
      to: email,
      subject: "Your Refund Has Been Processed",
      html,
    });

    console.log("✅ Refund email sent to", email);
  } catch (error) {
    console.error("❌ Failed to send refund email:", error.message);
  }
};
