const twofaService = require('../../src/services/twofa.service');
const cryptoService = require('../../src/services/crypto.service');

// Mock dependencies
jest.mock('../../src/services/crypto.service', () => ({
  encryptSecret: jest.fn((text) => `encrypted:${text}`),
  decryptSecret: jest.fn((text) => text.replace('encrypted:', ''))
}));

jest.mock('../../src/config/database', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] })
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn()
}));

describe('2FA Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSecret', () => {
    it('should generate a base32 secret and a uri', async () => {
      const email = 'test@ecoalerta.es';
      const result = await twofaService.generateSecret(email);
      
      expect(result).toHaveProperty('secretBase32');
      expect(result).toHaveProperty('secretBase32');
      expect(result).toHaveProperty('otpauthUrl');
      expect(result.secretBase32.length).toBeGreaterThan(0);
      expect(result.otpauthUrl).toContain('EcoAlerta');
      expect(result.otpauthUrl).toContain(encodeURIComponent(email));
    });
  });

  describe('verifyToken', () => {
    it('should return false for invalid token', async () => {
      const result = await twofaService.verifyToken('user123', '123456');
      expect(result).toBe(false);
    });

    // We can't easily test a valid TOTP without generating it synchronously here,
    // so we test the invalid case to ensure it doesn't just return true.
  });

  describe('generateRecoveryCodes', () => {
    it('should generate an array of 10 codes of length 8', async () => {
      const codes = await twofaService.generateRecoveryCodes('user123');
      
      expect(Array.isArray(codes)).toBe(true);
      expect(codes.length).toBe(10);
      codes.forEach(code => {
        expect(code.length).toBe(8);
        expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
      });
    });
  });
});
