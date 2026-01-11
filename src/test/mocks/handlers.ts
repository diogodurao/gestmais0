import { http, HttpResponse } from 'msw'

/**
 * MSW Request Handlers
 * Mock API endpoints for testing without hitting real backend
 */
export const handlers = [
  // Example: Mock payment update endpoint
  http.post('/api/payments/update', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      data: body
    })
  }),

  // Example: Mock extraordinary payment update
  http.post('/api/extraordinary/update', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      success: true,
      data: body
    })
  }),

  // Add more handlers as needed for your API routes
]
