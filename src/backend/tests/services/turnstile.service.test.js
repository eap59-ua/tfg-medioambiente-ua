const turnstileService = require('../../src/services/turnstile.service');

describe('Turnstile Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.TURNSTILE_SECRET_KEY = 'test_secret_key';
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    delete global.fetch;
  });

  it('should return true when Turnstile verification succeeds', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ success: true })
    });

    const result = await turnstileService.verifyTurnstileToken('valid_token', '127.0.0.1', 'login');
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String)
      })
    );
  });

  it('should return false when Turnstile verification fails', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] })
    });

    const result = await turnstileService.verifyTurnstileToken('invalid_token', '127.0.0.1', 'login');
    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain('invalid-input-response');
  });

  it('should return true when API call throws an error (fails open)', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));

    const result = await turnstileService.verifyTurnstileToken('any_token', '127.0.0.1', 'login');
    expect(result.success).toBe(true); // Fails open
  });

  it('should return true immediately if TURNSTILE_SECRET_KEY is missing', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    
    const result = await turnstileService.verifyTurnstileToken('any_token', '127.0.0.1', 'login');
    expect(result.success).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
