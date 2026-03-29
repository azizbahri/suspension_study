import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { client } from './client'
import { server } from '../test/server'

const BASE = 'http://localhost:8000/api/v1'

describe('axios client — error interceptor', () => {
  beforeEach(() => {
    // Reset to default handlers before each individual override
  })

  it('transforms response.data.detail into an Error message', async () => {
    server.use(
      http.get(`${BASE}/ping`, () =>
        HttpResponse.json({ detail: 'Custom backend error' }, { status: 400 })
      )
    )
    await expect(client.get('/ping')).rejects.toThrow('Custom backend error')
  })

  it('falls back to err.message when response has no detail field', async () => {
    server.use(
      http.get(`${BASE}/ping`, () =>
        HttpResponse.json({ message: 'something went wrong' }, { status: 500 })
      )
    )
    // axios message when no detail: "Request failed with status code 500"
    await expect(client.get('/ping')).rejects.toThrow('Request failed with status code 500')
  })

  it('passes successful responses through unchanged', async () => {
    server.use(
      http.get(`${BASE}/ping`, () => HttpResponse.json({ ok: true }))
    )
    const { data } = await client.get('/ping')
    expect(data).toEqual({ ok: true })
  })
})
