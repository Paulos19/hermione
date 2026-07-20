import CryptoJS from 'crypto-js';

const ENCRYPTION_PREFIX = 'ENC:';

export function encryptData(text: string | null | undefined, pin: string | null): string | null | undefined {
  return text;
}

export function decryptData(encryptedText: string | null | undefined, pin: string | null): string | null | undefined {
  return encryptedText;
}

export function isEncrypted(text: string | null | undefined): boolean {
  return false;
}
