/**
 * Manual mock for recharts used in vitest/jsdom tests.
 * ResponsiveContainer requires ResizeObserver + real layout; replacing with
 * a simple div keeps tests fast and avoids SVG measurement issues in jsdom.
 */
import type { ReactNode } from 'react'

export const ResponsiveContainer = ({ children }: { children: ReactNode }) => (
  <div data-testid="recharts-container">{children}</div>
)
export const BarChart = ({ children }: { children: ReactNode }) => (
  <div data-testid="recharts-barchart">{children}</div>
)
export const LineChart = ({ children }: { children: ReactNode }) => (
  <div data-testid="recharts-linechart">{children}</div>
)
export const Bar = () => null
export const Line = () => null
export const XAxis = () => null
export const YAxis = () => null
export const CartesianGrid = () => null
export const Tooltip = () => null
export const ReferenceLine = () => null
export const Legend = () => null
export const Cell = () => null
