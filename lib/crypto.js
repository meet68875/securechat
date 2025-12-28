// src/lib/crypto.js
import nacl from "tweetnacl";
import util from "tweetnacl-util";

// --- HELPERS (Convert weird computer bytes to strings) ---
export const encodeBase64 = (uint8Array) => util.encodeBase64(uint8Array);
export const decodeBase64 = (string) => util.decodeBase64(string);

/**
 * 1. Generate Identity Keys (Run this on Login/Register)
 * Returns object with publicKey and secretKey (as strings)
 */
export const generateKeyPair = () => {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey),
  };
};

/**
 * 2. Get My Keys (From LocalStorage)
 */
export const getMyKeys = () => {
  const stored = localStorage.getItem("chat_keys");
  if (!stored) return null;
  const parsed = JSON.parse(stored);
  return {
    publicKey: decodeBase64(parsed.publicKey),
    secretKey: decodeBase64(parsed.secretKey),
  };
};



export const encryptMessage = (text, recipientPublicKey) => {
  const myKeys = getMyKeys();
  if (!myKeys) throw new Error("No private key found!");

  // NaCl requires a 'nonce', but we will export it as 'iv' for your DB
  const nonceRef = nacl.randomBytes(nacl.box.nonceLength);
  const messageBytes = util.decodeUTF8(text);

  const encryptedBox = nacl.box(
    messageBytes,
    nonceRef,
    decodeBase64(recipientPublicKey),
    myKeys.secretKey
  );

  return {
    encryptedText: encodeBase64(encryptedBox),
    iv: encodeBase64(nonceRef),
  };
};

export const decryptMessage = (encryptedText, iv, senderPublicKey) => {
  const myKeys = getMyKeys();
  if (!myKeys) return "Decryption Error: No Keys";

  const decrypted = nacl.box.open(
    decodeBase64(encryptedText),
    decodeBase64(iv), // ✅ Use 'iv' input here
    decodeBase64(senderPublicKey),
    myKeys.secretKey
  );

  if (!decrypted) return "⚠️ Could not decrypt message";
  return util.encodeUTF8(decrypted);
};



// Helper: Turn string password into a CryptoKey
const getPasswordKey = (password) => 
  window.crypto.subtle.importKey("raw", util.decodeUTF8(password), "PBKDF2", false, ["deriveKey"]);

// Helper: Derive AES-GCM key from Password + Salt
const deriveKey = async (password, saltBase64) => {
  const passwordKey = await getPasswordKey(password);
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: util.decodeBase64(saltBase64),
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * 3. Encrypt Private Key (Run this when generating new keys)
 */
export const encryptPrivateKey = async (privateKeyBase64, password) => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const saltBase64 = util.encodeBase64(salt);
  const ivBase64 = util.encodeBase64(iv);

  const key = await deriveKey(password, saltBase64);
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    util.decodeBase64(privateKeyBase64)
  );

  return {
    encryptedPrivateKey: util.encodeBase64(new Uint8Array(encryptedBuffer)),
    keySalt: saltBase64,
    keyIv: ivBase64
  };
};

/**
 * 4. Decrypt Private Key (Run this on Login)
 */
export const decryptPrivateKey = async (encryptedKeyBase64, password, saltBase64, ivBase64) => {
  try {
    const key = await deriveKey(password, saltBase64);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: util.decodeBase64(ivBase64) },
      key,
      util.decodeBase64(encryptedKeyBase64)
    );
    
    return util.encodeBase64(new Uint8Array(decryptedBuffer));
  } catch (e) {
    console.error("Decryption failed. Wrong password?", e);
    return null;
  }
};