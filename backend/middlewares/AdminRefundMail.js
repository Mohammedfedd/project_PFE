import { createTransport } from "nodemailer";

export const sendAdminRefundMail = async ({ firstName, lastName, email, courseTitle, paymentIntentId }) => {
  try {
    const transport = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.Gmail,
        pass: process.env.Password,
      },
    });

    const fullName = `${firstName || "User"} ${lastName || ""}`.trim();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Refund Request</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      padding: 20px;
    }
    .container {
      background-color: #fff;
      padding: 30px;
      max-width: 600px;
      margin: auto;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h2 {
      color: #FF5722;
    }
    p {
      font-size: 15px;
      margin: 10px 0;
    }
    a {
      color: #FF5722;
      text-decoration: none;
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
    <h2>Refund Requested</h2>
    <p><strong>User:</strong> ${fullName} (${email})</p>
    <p><strong>Course:</strong> ${courseTitle}</p>
    <p><strong>Stripe Payment Intent:</strong> ${paymentIntentId || "Not provided"}</p>
    <br />
    <p>This user has initiated a refund. You can search for the payment intent in the <a href="https://dashboard.stripe.com/search?query=${paymentIntentId}" target="_blank">Stripe Dashboard</a>.</p>
    <br />
    <p class="footer">— Automated Notification</p>
  </div>
</body>
</html>`;

    await transport.sendMail({
      from: process.env.Gmail,
      to: "mohammedfeddouiisga@gmail.com",
      subject: `Refund Request - ${fullName}`,
      html,
    });

    console.log("✅ Admin refund notification sent");
  } catch (error) {
    console.error("❌ Failed to send admin refund email:", error.message);
  }
};
