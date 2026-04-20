const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendOTP(to, code) {
  await resend.emails.send({
    from: process.env.SMTP_FROM || 'BibiBeheer <onboarding@resend.dev>',
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
