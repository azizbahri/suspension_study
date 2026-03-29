import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAnalysisResult, useAnalyzeSession } from './useAnalysis'
import { makeQueryWrapper } from '../test/renderWithProviders'

describe('useAnalyzeSession', () => {
  it('POSTs to /analyze/:id and resolves with AnalysisResult', async () => {
    const { Wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useAnalyzeSession(), { wrapper: Wrapper })
    let data: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined
    await act(async () => {
      data = await result.current.mutateAsync('session-1')
    })
    expect(data?.session_id).toBe('session-1')
    expect(data?.duration_s).toBe(30.0)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useAnalysisResult', () => {
  it('fetches result from GET /analyze/:id when sessionId is provided', async () => {
    const { Wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useAnalysisResult('session-1'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.session_id).toBe('session-1')
  })

  it('stays idle (does not fetch) when sessionId is null', () => {
    const { Wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useAnalysisResult(null), { wrapper: Wrapper })
    // enabled: false → fetchStatus idle, no request fired
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})
