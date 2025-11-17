// src/utils/cryptoUtils.ts (新的工具文件)

/**
 * 将 ArrayBuffer 转换为 Base64 字符串 (URL Safe)
 * @param buffer - ArrayBuffer
 * @returns Base64 字符串
 */
function bufferToBase64Url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * 将 Base64 URL Safe 字符串转回 ArrayBuffer
 * @param base64Url - Base64 URL Safe 字符串
 * @returns ArrayBuffer
 */
function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  const padded = (base64Url + "==").slice(
    0,
    base64Url.length + (base64Url.length % 4)
  );
  const binaryString = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 使用 PBKDF2 派生加密密钥 (Exportable 格式)
 * @param pin - 用户输入的 PIN 码 (String)
 * @param salt - 用于派生的 Salt (ArrayBuffer)
 * @param iterations - 迭代次数 (Number)
 * @returns 一个可导出的 AES-256 密钥对象 (CryptoKey)
 */
export async function deriveKey(
  pin: string,
  salt: ArrayBuffer,
  iterations: number
): Promise<CryptoKey> {
  // 1. 将 PIN 转换为 Buffer (UTF-8 编码)
  const pinBuffer = new TextEncoder().encode(pin);

  // 2. 导入 PIN 作为 HMAC 密钥 (这是 PBKDF2 的输入)
  const baseKey = await crypto.subtle.importKey(
    "raw",
    pinBuffer,
    { name: "PBKDF2" },
    false, // 不可导出
    ["deriveKey"]
  );

  // 3. 使用 PBKDF2 派生出 AES-256-GCM 的密钥
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true, // 密钥导出为可用的格式 (JWK/ArrayBuffer)
    ["encrypt", "decrypt"]
  );

  return derivedKey;
}

/**
 * 生成一个新的随机 Salt
 * @returns ArrayBuffer 格式的 Salt
 */
export function generateSalt(): ArrayBuffer {
  // 推荐 Salt 长度为 16 字节 (128位)
  return crypto.getRandomValues(new Uint8Array(16)).buffer;
}

// --- AES-256-GCM 加密/解密工具 ---

// 推荐的 IV (Initialization Vector) 长度 for AES-GCM
const IV_LENGTH = 12;

/**
 * 使用 AES-GCM 加密数据
 * @param data - 要加密的原始数据 (Object 或 String)
 * @param key - 从 PBKDF2 派生出的 CryptoKey
 * @returns 包含 IV 和密文的 Promise，两者均为 Base64 URL Safe 字符串
 */
export async function encryptData(
  data: any,
  key: CryptoKey
): Promise<{ iv: string; cipherText: string }> {
  const dataString = JSON.stringify(data);
  const dataBuffer = new TextEncoder().encode(dataString);

  // 1. 生成随机 IV (Nonce)
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // 2. 加密
  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    dataBuffer
  );

  return {
    iv: bufferToBase64Url(iv.buffer),
    cipherText: bufferToBase64Url(cipherBuffer),
  };
}

/**
 * 使用 AES-GCM 解密数据
 * @param encryptedPackage - 包含 IV 和密文的 { iv, cipherText } 对象
 * @param key - 用于解密的 CryptoKey
 * @returns 解密后的原始数据对象
 */
export async function decryptData(
  encryptedPackage: { iv: string; cipherText: string },
  key: CryptoKey
): Promise<any> {
  const ivBuffer = base64UrlToBuffer(encryptedPackage.iv);
  const cipherBuffer = base64UrlToBuffer(encryptedPackage.cipherText);

  // 1. 解密
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    cipherBuffer
  );

  // 2. 转换为字符串并解析 JSON
  const decryptedString = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decryptedString);
}
// 导出辅助函数，方便在 Secure Storage 中存储和读取 Base64 格式的 Salt
export const CryptoHelpers = {
  bufferToBase64Url,
  base64UrlToBuffer,
};
