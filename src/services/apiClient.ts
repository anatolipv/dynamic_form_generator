import { fetchMockAutoFillData } from './mockApi'

export interface ApiResponse {
  success: boolean
  data?: Record<string, unknown>
  error?: string
}

/**
 * Fetches auto-fill data from mock API endpoints or real HTTP endpoints.
 *
 * For interview/demo flows, `/api/*` endpoints are resolved via local mock data.
 */
export async function fetchAutoFillData(
  endpoint: string,
  params: Record<string, unknown>,
): Promise<ApiResponse> {
  try {
    const mockResult = await fetchMockAutoFillData(endpoint, params)
    if (mockResult) {
      return mockResult
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = (await response.json()) as Record<string, unknown>
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}
