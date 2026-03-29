import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSessions, useImportSession, useDeleteSession } from './useSessions'
import { makeQueryWrapper } from '../test/renderWithProviders'
import type { ImportPayload } from '../api/sessions'

const IMPORT_PAYLOAD: ImportPayload = {
  csv_path: '/data/run.csv',
  name: 'Test Run',
  bike_slug: 't7_test',
  velocity_quantity: 'wheel',
  column_map: {
    time_col: 'time_s',
    front_raw_col: 'front_raw',
    rear_raw_col: 'rear_raw',
    gyro_y_col: 'gyro_y_raw',
    accel_x_col: 'accel_x_raw',
    accel_y_col: 'accel_y_raw',
    accel_z_col: 'accel_z_raw',
    invert_front: false,
    invert_rear: false,
  },
}

describe('useSessions', () => {
  it('fetches session list from GET /sessions', async () => {
    const { Wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useSessions(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data![0].id).toBe('session-1')
  })
})

describe('useImportSession', () => {
  it('POSTs to /sessions/import and resolves with the created session', async () => {
    const { Wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useImportSession(), { wrapper: Wrapper })
    await act(async () => {
      await result.current.mutateAsync(IMPORT_PAYLOAD)
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteSession', () => {
  it('DELETEs /sessions/:id and resolves', async () => {
    const { Wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useDeleteSession(), { wrapper: Wrapper })
    await act(async () => {
      await result.current.mutateAsync('session-1')
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
