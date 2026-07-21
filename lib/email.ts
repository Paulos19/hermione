import nodemailer from "nodemailer";

interface SendVerificationEmailParams {
  to: string;
  code: string;
  name?: string;
}

let testTransporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  // Support EMAIL_SERVER_* (Standard) and SMTP_* environment variables
  const host = process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST;
  const user = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS;
  const port = Number(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT) || 587;
  const secureStr = process.env.EMAIL_SERVER_SECURE || process.env.SMTP_SECURE;
  const isSecure = secureStr === "true" || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: {
        user,
        pass,
      },
      // Require TLS if port is 587
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Fallback to Ethereal Test Account if real SMTP creds are missing
  if (!testTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      testTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("📨 Ethereal Test Email Account criada:", testAccount.user);
    } catch (err) {
      console.error("Erro ao criar conta de teste Ethereal:", err);
    }
  }

  return testTransporter;
}

export async function sendVerificationEmail({ to, code, name }: SendVerificationEmailParams) {
  const transporter = await getTransporter();

  if (!transporter) {
    console.warn("⚠️ Transporter do Nodemailer não disponível. Código impresso no console:", code);
    return { success: true, previewUrl: null };
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || '"Chat Secret" <paulohenrique.012araujo@gmail.com>';

  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #0d0b15; color: #ffffff; padding: 40px 20px; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background: #181524; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
        <h1 style="font-size: 28px; font-weight: 700; letter-spacing: 3px; color: #ffffff; margin-bottom: 8px;">HERMIONE</h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 32px;">Código de Verificação de Conta</p>
        
        <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin-bottom: 24px;">
          Olá, ${name || "Autor"}! Use o código abaixo para confirmar seu e-mail e acessar a plataforma:
        </p>

        <div style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 16px; padding: 20px; font-size: 38px; font-weight: 800; letter-spacing: 14px; color: #c4b5fd; margin-bottom: 28px;">
          ${code}
        </div>

        <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 24px;">
          Este código expira em 10 minutos. Se você não solicitou este e-mail, pode ignorá-lo com segurança.
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `${code} é o seu código de verificação - Hermione`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("🔗 Preview do e-mail de verificação (Ethereal):", previewUrl);
    } else {
      console.log(`✅ E-mail enviado com sucesso via Gmail SMTP para ${to}! MessageId: ${info.messageId}`);
    }

    return { success: true, previewUrl: previewUrl || null };
  } catch (error) {
    console.error("Erro ao enviar e-mail via Nodemailer:", error);
    return { success: false, error };
  }
}
