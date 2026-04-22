const { encryptSecret, decryptSecret } = require('../../src/services/crypto.service');

describe('Crypto Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env.TOTP_ENCRYPTION_KEY = 'dGhpc0lzQVRlc3RLZXlGb3JEZXZPbmx5MzJieXRlcyE='; // Base64 for 32 bytes
  });

  afterAll(() => {
    process.env.TOTP_ENCRYPTION_KEY = originalEnv.TOTP_ENCRYPTION_KEY;
  });

  it('should encrypt and decrypt text successfully', () => {
    const plainText = 'mySecretData123';
    const encrypted = encryptSecret(plainText);
    
    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBe(plainText);
    
    // Check format iv:authTag:encryptedData
    const parts = encrypted.split(':');
    expect(parts.length).toBe(3);

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(plainText);
  });

  it('should return null if text to encrypt is empty', () => {
    expect(encryptSecret(null)).toBeNull();
    expect(encryptSecret(undefined)).toBeNull();
    expect(encryptSecret('')).toBeNull();
  });

  it('should return null if text to decrypt is empty', () => {
    expect(decryptSecret(null)).toBeNull();
    expect(decryptSecret(undefined)).toBeNull();
    expect(decryptSecret('')).toBeNull();
  });

  it('should throw error on invalid encrypted format', () => {
    expect(() => decryptSecret('invalid:format')).toThrow();
  });

  it('should throw error if encryption key is missing', () => {
    delete process.env.TOTP_ENCRYPTION_KEY;
    
    expect(() => encryptSecret('test')).toThrow('TOTP_ENCRYPTION_KEY no está configurada');
    expect(() => decryptSecret('iv:tag:data')).toThrow('TOTP_ENCRYPTION_KEY no está configurada');
  });

  it('should throw error if encryption key is not 32 bytes', () => {
    process.env.TOTP_ENCRYPTION_KEY = Buffer.from('shortkey').toString('base64');
    expect(() => encryptSecret('test')).toThrow('TOTP_ENCRYPTION_KEY debe ser de 32 bytes');
  });
});
