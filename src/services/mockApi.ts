export interface MockApiResponse {
  success: boolean
  data?: Record<string, unknown>
  error?: string
}

const ADDRESS_BY_ZIP: Record<string, Record<string, unknown>> = {
  '1000': {
    city: 'Sofia',
    state: 'Sofia City',
    region: 'Sofia City',
    country: 'Bulgaria',
  },
  '4000': {
    city: 'Plovdiv',
    state: 'Plovdiv',
    region: 'Plovdiv',
    country: 'Bulgaria',
  },
  '5000': {
    city: 'Veliko Tarnovo',
    state: 'Veliko Tarnovo',
    region: 'Veliko Tarnovo',
    country: 'Bulgaria',
  },
  '6000': {
    city: 'Stara Zagora',
    state: 'Stara Zagora',
    region: 'Stara Zagora',
    country: 'Bulgaria',
  },
  '7000': {
    city: 'Ruse',
    state: 'Ruse',
    region: 'Ruse',
    country: 'Bulgaria',
  },
  '8000': {
    city: 'Burgas',
    state: 'Burgas',
    region: 'Burgas',
    country: 'Bulgaria',
  },
  '9000': {
    city: 'Varna',
    state: 'Varna',
    region: 'Varna',
    country: 'Bulgaria',
  },
}

const COMPANY_BY_VAT: Record<string, Record<string, unknown>> = {
  BG123456789: {
    companyName: 'Tech Solutions Ltd',
    address: '123 Main St',
    companyAddress: '123 Main St',
    city: 'Sofia',
    companyCity: 'Sofia',
  },
  DE123456789: {
    companyName: 'Berlin Data GmbH',
    address: 'Alexanderplatz 8',
    companyAddress: 'Alexanderplatz 8',
    city: 'Berlin',
    companyCity: 'Berlin',
  },
}

const MOCK_DELAY_MS = 250

/**
 * Returns mocked API responses for known demonstration endpoints.
 *
 * Returning null signals that the endpoint is not handled by mock API.
 */
export async function fetchMockAutoFillData(
  endpoint: string,
  params: Record<string, unknown>,
): Promise<MockApiResponse | null> {
  if (!endpoint.startsWith('/api/')) {
    return null
  }

  await delay(MOCK_DELAY_MS)

  switch (endpoint) {
    case '/api/address':
      return resolveAddress(params)
    case '/api/company':
      return resolveCompany(params)
    default:
      return {
        success: false,
        error: `Mock endpoint "${endpoint}" is not implemented`,
      }
  }
}

function resolveAddress(params: Record<string, unknown>): MockApiResponse {
  const zipCode = normalize(
    params.zipCode ??
      params.postalCode ??
      params.personalPostalCode ??
      params.businessPostalCode,
  )
  if (!zipCode) {
    return {
      success: false,
      error: 'Postal code is required for address auto-fill',
    }
  }

  const data = ADDRESS_BY_ZIP[zipCode]
  if (!data) {
    return {
      success: false,
      error: `No Bulgarian city found for postal code ${zipCode}`,
    }
  }

  return { success: true, data }
}

function resolveCompany(params: Record<string, unknown>): MockApiResponse {
  const vatNumber = normalize(
    params.vatNumber ?? params.companyVatNumber ?? params.businessVatNumber,
  ).toUpperCase()
  if (!vatNumber) {
    return {
      success: false,
      error: 'VAT number is required for company auto-fill',
    }
  }

  const data = COMPANY_BY_VAT[vatNumber]
  if (!data) {
    return {
      success: false,
      error: `No company found for VAT number ${vatNumber}`,
    }
  }

  return { success: true, data }
}

function normalize(value: unknown): string {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
