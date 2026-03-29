import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { T7_BIKE, SESSION_1, SESSION_2, ANALYSIS_RESULT, FRONT_CAL_RESULT, REAR_CAL_RESULT, CAL_EXAMPLES, DEMO_STATUS } from './fixtures'

const BASE = 'http://localhost:8000/api/v1'

export const handlers = [
  // Bikes
  http.get(`${BASE}/bikes`, () => HttpResponse.json([T7_BIKE])),
  http.post(`${BASE}/bikes`, async ({ request }) => {
    const bike = await request.json()
    return HttpResponse.json(bike, { status: 201 })
  }),
  http.put(`${BASE}/bikes/:slug`, async ({ request }) => {
    const patch = await request.json()
    return HttpResponse.json({ ...T7_BIKE, ...(patch as object) })
  }),
  http.delete(`${BASE}/bikes/:slug`, () => new HttpResponse(null, { status: 204 })),

  // Sessions
  http.get(`${BASE}/sessions`, () => HttpResponse.json([SESSION_1, SESSION_2])),
  http.post(`${BASE}/sessions/import`, async ({ request }) => {
    const payload = await request.json()
    return HttpResponse.json({ ...SESSION_1, ...(payload as object) }, { status: 201 })
  }),
  http.delete(`${BASE}/sessions/:id`, () => new HttpResponse(null, { status: 204 })),

  // Analyze
  http.post(`${BASE}/analyze/:id`, () => HttpResponse.json(ANALYSIS_RESULT)),
  http.get(`${BASE}/analyze/:id`, () => HttpResponse.json(ANALYSIS_RESULT)),

  // Calibrate
  http.post(`${BASE}/calibrate/front`, () => HttpResponse.json(FRONT_CAL_RESULT)),
  http.post(`${BASE}/calibrate/rear`, () => HttpResponse.json(REAR_CAL_RESULT)),
  http.get(`${BASE}/calibrate/examples`, () => HttpResponse.json(CAL_EXAMPLES)),

  // Compare
  http.post(`${BASE}/compare`, () =>
    HttpResponse.json({
      sessions: [
        { session_id: 'session-1', session_name: SESSION_1.name, result: ANALYSIS_RESULT },
        { session_id: 'session-2', session_name: SESSION_2.name, result: ANALYSIS_RESULT },
      ],
    })
  ),

  // Demo status
  http.get(`${BASE}/demo`, () => HttpResponse.json(DEMO_STATUS)),
]

export const server = setupServer(...handlers)
