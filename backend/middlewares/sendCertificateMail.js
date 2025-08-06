import { createTransport } from "nodemailer";

const sendCertificateMail = async (data) => {
  console.log("📤 Preparing to send certificate email...");
  console.log("User:", data);

  const { firstName, email, certificateUrl, courseTitle } = data;

  console.log("➡️ Using firstName:", firstName);
  console.log("➡️ Using courseTitle:", courseTitle);
  console.log("➡️ Certificate URL:", certificateUrl);

  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
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
<title>Certificate of Completion</title>
<style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0; padding: 0;
    background-color: #f9fafb;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  .container {
    background: white;
    padding: 40px 30px;
    max-width: 500px;
    width: 90%;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    text-align: center;
  }
  h1 {
    color: #0a2540;
    font-size: 28px;
    margin-bottom: 15px;
  }
  p {
    color: #444;
    font-size: 16px;
    margin: 10px 0;
  }
  a.button {
    display: inline-block;
    margin-top: 25px;
    padding: 12px 25px;
    background-color: #0070f3;
    color: white;
    font-weight: 600;
    border-radius: 6px;
    text-decoration: none;
    font-size: 16px;
  }
  a.button:hover {
    background-color: #005bb5;
  }
  .footer {
    margin-top: 30px;
    font-size: 13px;
    color: #999;
  }
</style>
</head>
<body>
  <div class="container">
    <h1>Congratulations, ${firstName}!</h1>
    <p>You have successfully completed the course:</p>
    <p><strong>${courseTitle}</strong></p>
    <p>Your certificate is now available.</p>
    <a href="${certificateUrl}" class="button" target="_blank" rel="noopener noreferrer">View Your Certificate</a>
    <div class="footer">
      <p>If you did not request this email, please ignore it.</p>
      <p>Thank you for learning with us!</p>
    </div>
  </div>
</body>
</html>`;

  await transport.sendMail({
    from: `"Arti-learn" <${process.env.Gmail}>`,
    to: email,
    subject: `Your Certificate for ${courseTitle}`,
    html,
  });

  console.log("✅ Certificate email sent");
};

export default sendCertificateMail;
