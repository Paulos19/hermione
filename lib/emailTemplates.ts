const LOGO_URL = "https://0nxicue7ew.ufs.sh/f/BGEz3YvO4INzFpfmyVigMzXKEwAL6v41tVqjo8CUcmsZJIQB";

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hermione</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0B0F12;
      color: #E6E6E6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      width: 120px;
      height: auto;
      border-radius: 12px;
    }
    .card {
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #FFFFFF;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .text {
      font-size: 16px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 24px;
    }
    .code-box {
      background-color: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 20px;
      margin: 30px 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 8px;
      color: #FFFFFF;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }
    .btn {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 100px;
      font-weight: 600;
      font-size: 16px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="Hermione Logo" class="logo" />
    </div>
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Hermione. Todos os direitos reservados.</p>
      <p>Este é um e-mail automático, por favor, não responda.</p>
    </div>
  </div>
</body>
</html>
`;

export const getVerificationEmailTemplate = (code: string) => {
  const content = `
    <h1 class="title">Verifique sua conta</h1>
    <p class="text">Olá! Bem-vindo(a) ao Hermione. Para proteger seus segredos e continuar, precisamos confirmar seu e-mail.</p>
    <p class="text">Use o código abaixo no aplicativo:</p>
    <div class="code-box">${code}</div>
    <p class="text" style="font-size: 14px; color: rgba(255,255,255,0.5);">Este código expira em 15 minutos.</p>
  `;
  return baseTemplate(content);
};

export const getWelcomeEmailTemplate = (name: string) => {
  const firstName = name ? name.split(" ")[0] : "Escritor";
  const content = `
    <h1 class="title">Bem-vindo(a), ${firstName}!</h1>
    <p class="text">Sua conta foi verificada com sucesso. Agora você faz parte do ecossistema Hermione.</p>
    <p class="text">Aqui, seus pensamentos e histórias estão protegidos por criptografia de nível militar, envoltos em uma interface minimalista e focada em produtividade.</p>
    <p class="text">Comece a escrever e deixe a magia acontecer.</p>
  `;
  return baseTemplate(content);
};

export const getBackupEmailTemplate = (bookTitle: string) => {
  const content = `
    <h1 class="title">Seu Backup está pronto</h1>
    <p class="text">O backup do livro <strong>"${bookTitle}"</strong> foi gerado com sucesso.</p>
    <p class="text">Em anexo, você encontrará o arquivo <code>.hrm</code> contendo toda a sua obra, incluindo documentos, notas e personagens.</p>
    <p class="text">Lembre-se: O arquivo permanece criptografado e só poderá ser aberto ou restaurado com o PIN mestre original utilizado durante a escrita.</p>
  `;
  return baseTemplate(content);
};

export const getResetEmailTemplate = (code: string, type: "pin" | "password") => {
  const title = type === "pin" ? "Resetar PIN Mestre" : "Redefinir Senha";
  const typeText = type === "pin" ? "PIN Mestre" : "senha de acesso";
  const content = `
    <h1 class="title">${title}</h1>
    <p class="text">Recebemos uma solicitação para redefinir o seu ${typeText}.</p>
    <p class="text">Use o código de verificação abaixo no aplicativo:</p>
    <div class="code-box">${code}</div>
    <p class="text" style="font-size: 14px; color: rgba(255,255,255,0.5);">Se não foi você que solicitou, ignore este e-mail.</p>
  `;
  return baseTemplate(content);
};
