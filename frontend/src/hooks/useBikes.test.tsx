import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useBikes, useCreateBike, useUpdateBike, useDeleteBike } from './useBikes'
import { makeQueryWrapper } from '../test/renderWithProviders'
import { T7_BIKE } from '../test/fixtures'

describe('useBikes', () => {
  it('fetches the bike list from GET /bikes', async () => {
    const { Wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useBikes(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].slug).toBe('t7_test')
  })
})

describe('useCreateBike', () => {
  it('POSTs to /bikes and resolves with the created profile', async () => {
    const { Wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useCreateBike(), { wrapper: Wrapper })
    let created: typeof T7_BIKE | undefined
    await act(async () => {
      created = await result.current.mutateAsync(T7_BIKE)
    })
    expect(created?.slug).toBe('t7_test')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateBike', () => {
  it('PUTs to /bikes/:slug and resolves with the updated profile', async () => {
    const { Wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useUpdateBike(), { wrapper: Wrapper })
    let updated: typeof T7_BIKE | undefined
    await act(async () => {
      updated = await result.current.mutateAsync({ slug: 't7_test', bike: { c_front: 50 } })
    })
    expect(updated?.slug).toBe('t7_test')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteBike', () => {
  it('DELETEs /bikes/:slug and resolves', async () => {
    const { Wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useDeleteBike(), { wrapper: Wrapper })
    await act(async () => {
      await result.current.mutateAsync('t7_test')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
