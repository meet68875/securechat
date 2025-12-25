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
    iv: encodeBase64(nonceRef), // ✅ Renamed to 'iv'
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