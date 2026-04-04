/**
 * API Response Models for UK Postcode API
 */

export interface PostcodeResult {
  postcode: string;
  quality: number;
  eastings: number;
  northings: number;
  country: string;
  nhs_ha: string;
  longitude: number;
  latitude: number;
  european_electoral_region: string;
  primary_care_trust: string;
  region: string;
  lsoa: string;
  msoa: string;
  incode: string;
  outcode: string;
  parliamentary_constituency: string;
  admin_district: string;
  parish: string;
  admin_county: string;
  admin_ward: string;
  ced: string;
  ccg: string;
  nuts: string;
  codes: {
    admin_district: string;
    admin_county: string;
    admin_ward: string;
    parish: string;
    parliamentary_constituency: string;
    ccg: string;
    ccg_id: string;
    ced: string;
    nuts: string;
    lsoa: string;
    msoa: string;
    lau2: string;
  };
}

export interface PostcodeApiResponse {
  status: number;
  result: PostcodeResult | null;
  error?: string;
}

export interface BulkPostcodeResponse {
  status: number;
  result: Array<{
    query: string;
    result: PostcodeResult | null;
  }>;
}

export interface RandomPostcodeResponse {
  status: number;
  result: PostcodeResult;
}

export interface PostcodeValidationResponse {
  status: number;
  result: boolean;
}

export interface OutcodeResponse {
  status: number;
  result: {
    outcode: string;
    longitude: number;
    latitude: number;
    northings: number;
    eastings: number;
    admin_district: string[];
    parish: string[];
    admin_county: string[];
    admin_ward: string[];
    country: string[];
  };
}

/**
 * Test data constants
 */
export const TEST_POSTCODES = {
  VALID: {
    LONDON: 'SW1A 1AA',        // Buckingham Palace - guaranteed to exist
    MANCHESTER: 'M1 1AD',      // Manchester city center - corrected
    BIRMINGHAM: 'B33 8TH',     // Birmingham - corrected 
    GLASGOW: 'G1 1QA',         // Glasgow city center - verified working
    CARDIFF: 'CF10 3AT'        // Cardiff - corrected
  },
  INVALID: {
    MALFORMED: 'INVALID123',
    NON_EXISTENT: 'ZZ99 9ZZ',
    EMPTY: '',
    SPECIAL_CHARS: 'SW1@ 1@@'
  },
  EDGE_CASES: {
    LOWERCASE: 'sw1a 1aa',
    NO_SPACE: 'SW1A1AA',
    EXTRA_SPACES: 'SW1A  1AA',
    LEADING_TRAILING_SPACES: ' SW1A 1AA '
  }
};

export const TEST_OUTCODES = {
  VALID: ['SW1A', 'M1', 'B1', 'G1', 'CF10'],
  INVALID: ['ZZ99', 'INVALID', '123']
};

/**
 * API endpoints
 */
export const ENDPOINTS = {
  POSTCODE: '/postcodes',
  POSTCODE_LOOKUP: (postcode: string) => `/postcodes/${encodeURIComponent(postcode)}`,
  POSTCODE_VALIDATE: (postcode: string) => `/postcodes/${encodeURIComponent(postcode)}/validate`,
  BULK_LOOKUP: '/postcodes',
  RANDOM_POSTCODE: '/random/postcodes',
  OUTCODE_LOOKUP: (outcode: string) => `/outcodes/${encodeURIComponent(outcode)}`,
  NEAREST_POSTCODES: (postcode: string) => `/postcodes/${encodeURIComponent(postcode)}/nearest`
};

/**
 * Expected response structures for validation
 */
export const EXPECTED_POSTCODE_FIELDS = [
  'postcode',
  'quality',
  'eastings',
  'northings',
  'country',
  'longitude',
  'latitude',
  'region',
  'admin_district',
  'codes'
];

export const EXPECTED_OUTCODE_FIELDS = [
  'outcode',
  'longitude',
  'latitude',
  'northings',
  'eastings',
  'admin_district',
  'parish',
  'admin_county',
  'admin_ward',
  'country'
];