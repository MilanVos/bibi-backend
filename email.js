const nodemailer = require('nodemailer')

async function sendOTP(to, code) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'BibiBeheer - Verificatiecode',
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto">
        <h2 style="color:#051b4a">BibiBeheer</h2>
        <p>Jouw verificatiecode is:</p>
        <h1 style="letter-spacing:8px;color:#3a0647;font-size:2.5rem">${code}</h1>
        <p style="color:#888">Deze code is 10 minuten geldig.</p>
      </div>
    `
  })
}

module.exports = { sendOTP }
