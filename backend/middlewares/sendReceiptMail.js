import { createTransport } from "nodemailer";

export const sendReceiptMail = async ({ firstName ,lastName, email, course, amount }) => {
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
  <title>Payment Receipt</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
      color: #4CAF50;
      margin-bottom: 10px;
    }
    .detail {
      margin: 12px 0;
      font-size: 15px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Payment Successful</h2>
    <p class="detail">Hi <strong>${firstName} ${lastName}</strong>,</p>
    <p class="detail">Thank you for purchasing the course: <strong>${course.title}</strong>.</p>
    <p class="detail">Amount Paid: <strong>${amount / 100} MAD</strong></p>
    <p class="detail">We hope you enjoy the learning experience!</p>
    <p class="footer">This is an automated receipt. If you have any questions, contact us at support@example.com.</p>
  </div>
</body>
</html>`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject: "Your Payment Receipt",
    html,
  });
};
