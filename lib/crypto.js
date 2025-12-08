import crypto from 'crypto';

/**
 * Generates a server-side identity key pair for a user.
 * Returns the keys in base64 format.
 */
export function generateIdentityKeys() {
  // Generate an Ed25519 key pair for signing (or X25519 for ECDH)
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },  // DER-encoded public key
    privateKeyEncoding: { type: 'pkcs8', format: 'der' }, // DER-encoded private key
  });

  return {
    publicKeyBase64: publicKey.toString('base64'),
    privateKeyBase64: privateKey.toString('base64'),
  };
}
