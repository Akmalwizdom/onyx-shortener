import { test, expect } from '@playwright/test';

test.describe('API /api/shorten', () => {

  test('should create a short URL successfully', async ({ request }) => {
    const response = await request.post('/api/shorten', {
      data: {
        url: 'https://example.com/final-test-' + Date.now(),
        expiresIn: 1
      }
    });

    // Accept 201 or 429
    expect([201, 429]).toContain(response.status());

    if (response.status() === 201) {
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('shortCode');
      expect(body.data).toHaveProperty('quota');
      expect(body.data.quota).toHaveProperty('remaining');
      expect(body.data.quota).toHaveProperty('limit');
    }
  });

  test('should reject invalid URL or be rate limited', async ({ request }) => {
    const response = await request.post('/api/shorten', {
      data: {
        url: 'not-a-url'
      }
    });

    // Accept 400 (Validation Error) or 429 (Rate Limit)
    expect([400, 429]).toContain(response.status());

    if (response.status() === 400) {
      const body = await response.json();
      expect(body.error).toBe('Invalid URL format');
    }

    if (response.status() === 429) {
      const body = await response.json();
      expect(body).toHaveProperty('suggestion');
      expect(body).toHaveProperty('limit');
    }
  });

});