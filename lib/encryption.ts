import CryptoJS from 'crypto-js';

const ENCRYPTION_PREFIX = 'ENC:';

/**
 * Criptografa um texto usando AES e uma chave (PIN).
 * Se o texto já estiver criptografado ou for vazio/null, retorna o próprio texto.
 */
export function encryptData(text: string | null | undefined, pin: string | null): string | null | undefined {
  if (!text) return text;
  if (text.startsWith(ENCRYPTION_PREFIX)) return text; // Já criptografado
  if (!pin) {
    console.warn("Nenhum PIN fornecido para criptografia.");
    return text;
  }

  try {
    const ciphertext = CryptoJS.AES.encrypt(text, pin).toString();
    return `${ENCRYPTION_PREFIX}${ciphertext}`;
  } catch (error) {
    console.error("Erro ao criptografar os dados:", error);
    return text;
  }
}

/**
 * Descriptografa um texto que foi criptografado com o método acima.
 * Se o texto não estiver criptografado, retorna o texto original em claro.
 */
export function decryptData(encryptedText: string | null | undefined, pin: string | null): string | null | undefined {
  if (!encryptedText) return encryptedText;
  if (!encryptedText.startsWith(ENCRYPTION_PREFIX)) return encryptedText; // É texto puro (retrocompatibilidade)
  if (!pin) {
    console.warn("Nenhum PIN fornecido para descriptografia de dados criptografados.");
    return "Conteúdo Protegido (Requer PIN)";
  }

  try {
    const ciphertext = encryptedText.replace(ENCRYPTION_PREFIX, '');
    const bytes = CryptoJS.AES.decrypt(ciphertext, pin);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      throw new Error("Falha na descriptografia. PIN incorreto ou dados corrompidos.");
    }
    
    return originalText;
  } catch (error) {
    console.error("Erro ao descriptografar os dados:", error);
    return "ERRO_DESCRIPTOGRAFIA";
  }
}

/**
 * Verifica se um texto está criptografado (tem o prefixo).
 */
export function isEncrypted(text: string | null | undefined): boolean {
  if (!text) return false;
  return text.startsWith(ENCRYPTION_PREFIX);
}
