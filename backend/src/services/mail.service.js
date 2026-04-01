import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

// Verify the connection configuration (async, non-blocking)
transporter
  .verify()
  .then(() => {
    console.log("✅ Email transporter is ready to send emails");
  })
  .catch((error) => {
    console.warn("⚠️ Email transporter warning:", error.message);
  });

export async function sendEmail({ to, subject, html, text }) {
  if (!to || !subject || (!html && !text)) {
    throw new Error("Missing required email parameters");
  }
  const mailOptions = {
    from: process.env.GOOGLE_USER,
    to,
    subject,
    html,
    text,
  };

  const details = await transporter.sendMail(mailOptions);
  console.log("Email sent successfully", details);
  console.log(process.env.GOOGLE_USER);
  console.log(process.env.GOOGLE_APP_PASSWORD);
}
