const qrService = require('../../src/services/qr.service');

describe('QR Service', () => {
  it('should generate a QR code buffer', async () => {
    const url = 'https://ecoalerta.test';
    const buffer = await qrService.generateQR(url);
    
    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should return cached buffer on subsequent calls', async () => {
    const url = 'https://ecoalerta.test/cache';
    
    const buffer1 = await qrService.generateQR(url);
    const buffer2 = await qrService.generateQR(url);
    
    expect(buffer1).toBe(buffer2); // Same reference means it came from cache
  });

  it('should generate different buffers for different options', async () => {
    const url = 'https://ecoalerta.test/opts';
    
    const buffer1 = await qrService.generateQR(url, { size: 100 });
    const buffer2 = await qrService.generateQR(url, { size: 200 });
    
    expect(buffer1).not.toBe(buffer2);
  });
});
