import { createTransport } from "nodemailer";

const sendMail = async (email, subject, data) => {
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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .container {
      background-color: #ffffff;
      padding: 40px 30px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }
    h1 {
      font-size: 24px;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    p {
      font-size: 16px;
      color: #555;
      margin: 12px 0;
    }
    .code {
      font-size: 40px;
      font-weight: bold;
      color: #4a00e0;
      background-color: #f0f0ff;
      padding: 15px 20px;
      border-radius: 8px;
      display: inline-block;
      margin-top: 20px;
      letter-spacing: 4px;
    }
    .footer {
      font-size: 13px;
      color: #999;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Arti-learn 🎉</h1>
    <p>Hi <strong>${data.name}</strong>,</p>
    <p>Thanks for registering! To complete your sign-up, please use the verification code below:</p>
    <div class="code">${data.otp}</div>
    <p class="footer">Didn’t request this code? Just ignore this message and you’re good to go.</p>
  </div>
</body>
</html>`;


  await transport.sendMail({
  from: `"arti-learn" <${process.env.Gmail}>`,
  to: data.email,
  subject,
  html,
});
};

export default sendMail;

export const sendForgotMail = async (subject, data) => {
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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .container {
      background-color: #ffffff;
      padding: 40px 30px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }
    h1 {
      font-size: 24px;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    p {
      font-size: 16px;
      color: #555;
      margin: 12px 0;
    }
    .button {
      display: inline-block;
      padding: 15px 25px;
      margin: 20px 0;
      background-color: #4a00e0;
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
    }
    .footer {
      font-size: 13px;
      color: #999;
      margin-top: 30px;
    }
    .footer a {
      color: #4a00e0;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset Request</h1>
    <p>Hello,</p>
    <p>We received a request to reset your password. You can set a new one by clicking the button below:</p>
    <a href="${process.env.frontendurl}/reset-password/${data.token}" class="button">Reset Password</a>
    <p>If you didn’t ask to reset your password, no worries, just ignore this email.</p>
    <div class="footer">
      <p>Thanks,<br>The Arti-learn Team</p>
    </div>
  </div>
</body>
</html>`;

  await transport.sendMail({
  from: `"arti-learn" <${process.env.Gmail}>`,
  to: data.email,
  subject,
  html,
});
};
