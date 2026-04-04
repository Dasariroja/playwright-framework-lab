import { test, expect } from '@playwright/test';
import { ApiClient } from '../../utils/api-client';
import {
  PostcodeApiResponse,
  BulkPostcodeResponse,
  RandomPostcodeResponse,
  PostcodeValidationResponse,
  OutcodeResponse,
  TEST_POSTCODES,
  TEST_OUTCODES,
  ENDPOINTS,
  EXPECTED_POSTCODE_FIELDS,
  EXPECTED_OUTCODE_FIELDS
} from './models/postcode.models';

test.describe('UK Postcode API Tests @api', () => {
  let apiClient: ApiClient;

  test.beforeAll(async () => {
    apiClient = new ApiClient(process.env.API_BASE_URL || 'https://api.postcodes.io');
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test.describe('Single Postcode Lookup', () => {
    test('should successfully lookup valid London postcode @smoke @regression', async () => {
      const postcode = TEST_POSTCODES.VALID.LONDON;
      const response = await apiClient.get(ENDPOINTS.POSTCODE_LOOKUP(postcode));

      expect(response.status()).toBe(200);

      const data: PostcodeApiResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toBeTruthy();

      const result = data.result!;
      EXPECTED_POSTCODE_FIELDS.forEach(field => {
        expect(result).toHaveProperty(field);
      });

      expect(result.postcode).toBe(postcode);
      expect(result.country).toBe('England');
      expect(result.region).toBe('London');
      expect(typeof result.longitude).toBe('number');
      expect(typeof result.latitude).toBe('number');
    });

    test('should successfully lookup valid Manchester postcode @regression', async () => {
      const postcode = TEST_POSTCODES.VALID.MANCHESTER;
      const response = await apiClient.get(ENDPOINTS.POSTCODE_LOOKUP(postcode));

      expect(response.status()).toBe(200);

      const data: PostcodeApiResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toBeTruthy();

      const result = data.result!;
      expect(result.postcode).toBe(postcode);
      expect(result.country).toBe('England');
      expect(result.admin_district).toBe('Manchester');
    });

    test('should successfully lookup valid Glasgow postcode (Scotland) @regression', async () => {
      const postcode = TEST_POSTCODES.VALID.GLASGOW;
      const response = await apiClient.get(ENDPOINTS.POSTCODE_LOOKUP(postcode));

      expect(response.status()).toBe(200);

      const data: PostcodeApiResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toBeTruthy();

      const result = data.result!;
      expect(result.postcode).toBe(postcode);
      expect(result.country).toBe('Scotland');
    });

    test('should return 404 for invalid postcode @negative @regression', async () => {
      const invalidPostcode = TEST_POSTCODES.INVALID.NON_EXISTENT;
      const response = await apiClient.get(ENDPOINTS.POSTCODE_LOOKUP(invalidPostcode));

      expect(response.status()).toBe(404);

      const data: PostcodeApiResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(404);
      expect(data.result).toBeFalsy();
      expect(data.error).toBeTruthy();
    });

    test('should return 404 for malformed postcode @negative @regression', async () => {
      const malformedPostcode = TEST_POSTCODES.INVALID.MALFORMED;
      const response = await apiClient.get(ENDPOINTS.POSTCODE_LOOKUP(malformedPostcode));

      expect(response.status()).toBe(404);

      const data: PostcodeApiResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(404);
      expect(data.result).toBeFalsy();
    });

    test('should handle lowercase postcode correctly @edge-case', async () => {
      const lowercasePostcode = TEST_POSTCODES.EDGE_CASES.LOWERCASE;
      const response = await apiClient.get(ENDPOINTS.POSTCODE_LOOKUP(lowercasePostcode));

      expect(response.status()).toBe(200);

      const data: PostcodeApiResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toBeTruthy();
      expect(data.result!.postcode).toBe('SW1A 1AA');
    });

    test('should handle postcode without space @edge-case', async () => {
      const noSpacePostcode = TEST_POSTCODES.EDGE_CASES.NO_SPACE;
      const response = await apiClient.get(ENDPOINTS.POSTCODE_LOOKUP(noSpacePostcode));

      expect(response.status()).toBe(200);

      const data: PostcodeApiResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toBeTruthy();
      expect(data.result!.postcode).toBe('SW1A 1AA');
    });
  });

  test.describe('Postcode Validation', () => {
    test('should validate correct postcode format @smoke @regression', async () => {
      const validPostcode = TEST_POSTCODES.VALID.LONDON;
      const response = await apiClient.get(ENDPOINTS.POSTCODE_VALIDATE(validPostcode));

      expect(response.status()).toBe(200);

      const data: PostcodeValidationResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toBe(true);
    });

    test('should invalidate incorrect postcode format @negative @regression', async () => {
      const invalidPostcode = TEST_POSTCODES.INVALID.MALFORMED;
      const response = await apiClient.get(ENDPOINTS.POSTCODE_VALIDATE(invalidPostcode));

      expect(response.status()).toBe(200);

      const data: PostcodeValidationResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toBe(false);
    });

    test('should invalidate non-existent but correctly formatted postcode @negative @regression', async () => {
      const nonExistentPostcode = TEST_POSTCODES.INVALID.NON_EXISTENT;
      const response = await apiClient.get(ENDPOINTS.POSTCODE_VALIDATE(nonExistentPostcode));

      expect(response.status()).toBe(200);

      const data: PostcodeValidationResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toBe(false);
    });
  });

  test.describe('Bulk Postcode Lookup', () => {
    test('should successfully lookup multiple valid postcodes @smoke @regression', async () => {
      const postcodes = [
        TEST_POSTCODES.VALID.LONDON,
        TEST_POSTCODES.VALID.MANCHESTER,
        TEST_POSTCODES.VALID.BIRMINGHAM
      ];

      const response = await apiClient.post(ENDPOINTS.BULK_LOOKUP, { data: { postcodes } });

      expect(response.status()).toBe(200);

      const data: BulkPostcodeResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toHaveLength(3);

      data.result.forEach((item, index) => {
        expect(item.query).toBe(postcodes[index]);
        expect(item.result).toBeTruthy();
        expect(item.result!.postcode).toBe(postcodes[index]);
      });
    });

    test('should handle mixed valid and invalid postcodes @regression', async () => {
      const postcodes = [
        TEST_POSTCODES.VALID.LONDON,
        TEST_POSTCODES.INVALID.NON_EXISTENT,
        TEST_POSTCODES.VALID.MANCHESTER
      ];

      const response = await apiClient.post(ENDPOINTS.BULK_LOOKUP, { data: { postcodes } });

      expect(response.status()).toBe(200);

      const data: BulkPostcodeResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toHaveLength(3);

      expect(data.result[0].result).toBeTruthy();
      expect(data.result[1].result).toBeNull();
      expect(data.result[2].result).toBeTruthy();
    });

    test('should handle empty postcodes array @edge-case', async () => {
      const response = await apiClient.post(ENDPOINTS.BULK_LOOKUP, { data: { postcodes: [] } });

      // API may return 200 with empty results or 400
      expect([200, 400]).toContain(response.status());
    });

    test('should handle maximum postcodes limit @edge-case @negative', async () => {
      const postcodes = Array(101).fill(TEST_POSTCODES.VALID.LONDON);

      const response = await apiClient.post(ENDPOINTS.BULK_LOOKUP, { data: { postcodes } });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Random Postcode', () => {
    test('should return valid random postcode @smoke @regression', async () => {
      const response = await apiClient.get(ENDPOINTS.RANDOM_POSTCODE);

      expect(response.status()).toBe(200);

      const data: RandomPostcodeResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toBeTruthy();

      const result = data.result;
      EXPECTED_POSTCODE_FIELDS.forEach(field => {
        expect(result).toHaveProperty(field);
      });

      expect(result.postcode).toMatch(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s\d[A-Z]{2}$/);
    });

    test('should return different postcodes on multiple calls @regression', async () => {
      const response1 = await apiClient.get(ENDPOINTS.RANDOM_POSTCODE);
      const response2 = await apiClient.get(ENDPOINTS.RANDOM_POSTCODE);

      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);

      const data1: RandomPostcodeResponse = await apiClient.getJsonResponse(response1);
      const data2: RandomPostcodeResponse = await apiClient.getJsonResponse(response2);

      // While not guaranteed, it's highly unlikely to get the same postcode twice
      expect(data1.result.postcode).not.toBe(data2.result.postcode);
    });
  });

  test.describe('Outcode Lookup', () => {
    test('should successfully lookup valid outcode @regression', async () => {
      const outcode = TEST_OUTCODES.VALID[0];
      const response = await apiClient.get(ENDPOINTS.OUTCODE_LOOKUP(outcode));

      expect(response.status()).toBe(200);

      const data: OutcodeResponse = await apiClient.getJsonResponse(response);
      expect(data.status).toBe(200);
      expect(data.result).toBeTruthy();

      const result = data.result;
      EXPECTED_OUTCODE_FIELDS.forEach(field => {
        expect(result).toHaveProperty(field);
      });

      expect(result.outcode).toBe(outcode);
      expect(typeof result.longitude).toBe('number');
      expect(typeof result.latitude).toBe('number');
    });

    test('should return 404 for invalid outcode @negative', async () => {
      const invalidOutcode = TEST_OUTCODES.INVALID[0];
      const response = await apiClient.get(ENDPOINTS.OUTCODE_LOOKUP(invalidOutcode));

      expect(response.status()).toBe(404);
    });
  });

  test.describe('Performance and Rate Limiting', () => {
    test('should handle multiple concurrent requests @regression', async () => {
      const promises = Array(5).fill(null).map(() =>
        apiClient.get(ENDPOINTS.POSTCODE_LOOKUP(TEST_POSTCODES.VALID.LONDON))
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
    });

    test('should respond within acceptable time limits @regression', async () => {
      const startTime = Date.now();
      const response = await apiClient.get(ENDPOINTS.POSTCODE_LOOKUP(TEST_POSTCODES.VALID.LONDON));
      const duration = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid JSON in POST request @negative', async () => {
      const response = await apiClient.post(ENDPOINTS.BULK_LOOKUP, {
        data: 'invalid json string'
      });

      expect(response.status()).toBe(400);
    });

    test('should handle missing required fields in POST request @negative', async () => {
      const response = await apiClient.post(ENDPOINTS.BULK_LOOKUP, {
        data: { invalid_field: 'test' }
      });

      expect(response.status()).toBe(400);
    });

    test('should return proper error format for invalid requests @negative @regression', async () => {
      const response = await apiClient.get('/invalid-endpoint');

      expect(response.status()).toBe(404);

      const data = await apiClient.getJsonResponse(response);
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('error');
    });
  });

  test('should trim spaces in postcode @edge-case', async () => {
    const postcode = TEST_POSTCODES.EDGE_CASES.LEADING_TRAILING_SPACES;

    const response = await apiClient.get(ENDPOINTS.POSTCODE_LOOKUP(postcode));

    expect(response.status()).toBe(200);

    const data = await apiClient.getJsonResponse(response);
    expect(data.result).toBeTruthy();
    expect(data.result!.postcode).toBe('SW1A 1AA');
  });

  test('simple api test', async () => {
  const response = await apiClient.get('/postcodes/SW1A 1AA');
  
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data.result.postcode).toBe('SW1A 1AA');

  });

});