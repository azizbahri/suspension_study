# Frontend Testing Plan

## Overview

This document defines the strategy, tooling, test cases, and implementation order for testing the Suspension Study React frontend. The frontend is a local desktop web application — no server-side rendering, no authentication, and all API calls go to a local FastAPI backend at `http://localhost:8000/api/v1`.

---

## 1. Testing Stack

| Tool | Role | Rationale |
|------|------|-----------|
| **Vitest** | Test runner + assertion library | Native Vite integration; Jest-compatible API; no configuration overhead |
| **@testing-library/react** | Component rendering and DOM queries | Tests what the user sees, not implementation details |
| **@testing-library/user-event** | Realistic user input simulation | Simulates real browser events (click, type, keyboard) |
| **msw** (Mock Service Worker) | API mocking at the network level | Intercepts `axios` requests without patching modules; shared between tests and dev |
| **@vitest/coverage-v8** | Coverage reporting | Built into Vitest; zero extra config |
| **jsdom** | Browser DOM environment | Vitest test environment for React components |

### Installation

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/user-event \
               @testing-library/jest-dom msw @vitest/coverage-v8 jsdom
```

### Configuration additions

**`vite.config.ts`** — add test block:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/main.tsx'],
    },
  },
});
```

**`src/test/setup.ts`**:

```ts
import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './msw/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**`src/test/msw/server.ts`**:

```ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);
```

**`src/test/msw/handlers.ts`** — default happy-path handlers:

```ts
import { http, HttpResponse } from 'msw';

const T7_BIKE = {
  name: "Yamaha Ténéré 700", slug: "t7",
  w_max_front_mm: 210, w_max_rear_mm: 210, fork_angle_deg: 27,
  c_front: 42, v0_front: 0.5, c_rear: 18.5, v0_rear: 0.4,
  linkage_a: -0.015, linkage_b: 4.2, linkage_c: 0,
  adc_bits: 12, v_ref: 5, fs_hz: 250,
  lpf_cutoff_disp_hz: 20, lpf_cutoff_gyro_hz: 10,
  complementary_alpha: 0.98, stationary_samples: 250,
  gyro_sensitivity: 16.4, accel_sensitivity: 2048, ls_threshold_mm_s: 150,
};

const MOCK_SESSION = {
  id: 'sess-1', name: 'Test Session', bike_slug: 't7',
  csv_path: '/tmp/test.csv', column_map: {
    time_col: 'time_s', front_raw_col: 'front_raw', rear_raw_col: 'rear_raw',
    gyro_y_col: 'gyro_y_raw', accel_x_col: 'accel_x_raw',
    accel_y_col: 'accel_y_raw', accel_z_col: 'accel_z_raw',
    invert_front: false, invert_rear: false,
  },
  velocity_quantity: 'shaft', created_at: '2026-01-01T00:00:00Z', analyzed: false,
};

const TRAVEL_HIST = {
  centers_pct: [5,15,25,35,45,55,65,75,85,95],
  time_pct:    [1, 2, 5,40,30, 8, 5, 4, 3, 2],
  peak_center_pct: 35, pct_above_80: 5,
};

const VEL_HIST = {
  centers_mm_s: Array.from({ length: 60 }, (_, i) => -1475 + i * 50),
  time_pct:     Array.from({ length: 60 }, (_, i) => i === 29 ? 10 : 1.5),
  compression_area_pct: 49, rebound_area_pct: 49,
  ls_compression_pct: 30, hs_compression_pct: 19,
  ls_rebound_pct: 30, hs_rebound_pct: 19,
};

const MOCK_RESULT = {
  session_id: 'sess-1',
  front_travel: TRAVEL_HIST, rear_travel: TRAVEL_HIST,
  front_velocity: VEL_HIST, rear_velocity: VEL_HIST,
  pitch: {
    time_s: Array.from({ length: 100 }, (_, i) => i * 0.004),
    pitch_deg: Array.from({ length: 100 }, () => 0),
    accel_x_g: Array.from({ length: 100 }, () => 0),
  },
  diagnostics: [],
  duration_s: 10, sample_count: 2500,
};

export const handlers = [
  http.get('http://localhost:8000/api/v1/bikes',    () => HttpResponse.json([T7_BIKE])),
  http.post('http://localhost:8000/api/v1/bikes',   async ({ request }) => HttpResponse.json(await request.json(), { status: 201 })),
  http.put('http://localhost:8000/api/v1/bikes/:slug', async ({ request }) => HttpResponse.json(await request.json())),
  http.delete('http://localhost:8000/api/v1/bikes/:slug', () => new HttpResponse(null, { status: 204 })),

  http.get('http://localhost:8000/api/v1/sessions',  () => HttpResponse.json([MOCK_SESSION])),
  http.post('http://localhost:8000/api/v1/sessions/import', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...MOCK_SESSION, name: body.name as string }, { status: 201 });
  }),
  http.delete('http://localhost:8000/api/v1/sessions/:id', () => new HttpResponse(null, { status: 204 })),

  http.post('http://localhost:8000/api/v1/calibrate/front', () =>
    HttpResponse.json({ c_cal: 42.0, v0: 0.5, rmse: 0.001 })),
  http.post('http://localhost:8000/api/v1/calibrate/rear', () =>
    HttpResponse.json({ a: -0.015, b: 4.2, c: 0, rmse: 0.01 })),

  http.post('http://localhost:8000/api/v1/analyze/:id', () =>
    HttpResponse.json({ ...MOCK_RESULT })),
  http.get('http://localhost:8000/api/v1/analyze/:id/result', () =>
    HttpResponse.json({ ...MOCK_RESULT })),

  http.post('http://localhost:8000/api/v1/compare', async ({ request }) => {
    const body = await request.json() as { session_ids: string[] };
    return HttpResponse.json({
      sessions: body.session_ids.map((id) => ({
        session_id: id, session_name: 'Session ' + id,
        result: MOCK_RESULT,
      })),
      granularity: 'session',
    });
  }),
];
```

**`package.json`** — add test scripts:

```json
"scripts": {
  "test":          "vitest run",
  "test:watch":    "vitest",
  "test:coverage": "vitest run --coverage"
}
```

---

## 2. Test File Structure

```
frontend/src/
└── test/
    ├── setup.ts
    ├── msw/
    │   ├── server.ts
    │   └── handlers.ts
    ├── components/
    │   ├── TravelHistogram.test.tsx
    │   ├── VelocityHistogram.test.tsx
    │   ├── PitchChart.test.tsx
    │   ├── DiagnosticCard.test.tsx
    │   ├── BikeSelector.test.tsx
    │   └── Layout.test.tsx
    ├── pages/
    │   ├── ImportPage.test.tsx
    │   ├── CalibratePage.test.tsx
    │   ├── AnalyzePage.test.tsx
    │   └── ComparePage.test.tsx
    ├── api/
    │   └── client.test.ts
    └── hooks/
        ├── useBikes.test.tsx
        └── useSessions.test.tsx
```

---

## 3. Component Unit Tests

### 3.1 `TravelHistogram.test.tsx`

| # | Test | What to assert |
|---|------|----------------|
| 1 | Renders with valid data | Container is present; title text appears |
| 2 | Peak and above-80% stats shown | "Peak: 35.0%" and "Above 80%: 5.0%" visible |
| 3 | Renders zero data gracefully | No crash on `time_pct: [0,0,0...]`, all bars at 0 |
| 4 | Sag reference line rendered | `<line>` element with green stroke present in SVG |
| 5 | 80% reference line rendered | `<line>` element with red stroke present in SVG |

**Key technique:** Recharts renders SVG; use `container.querySelector('svg')` to confirm chart presence. Avoid asserting on specific SVG paths — those are implementation details.

### 3.2 `VelocityHistogram.test.tsx`

| # | Test | What to assert |
|---|------|----------------|
| 1 | Renders with valid data | Container and title rendered |
| 2 | Summary statistics shown | Compression%, rebound%, LS%, HS% text visible |
| 3 | Legend labels present | "Compression" and "Rebound" text in DOM |
| 4 | Zero-velocity reference line | At least one reference line rendered in SVG |

### 3.3 `PitchChart.test.tsx`

| # | Test | What to assert |
|---|------|----------------|
| 1 | Renders with short trace | No crash; SVG present |
| 2 | Sub-samples long traces | When `sampleCount > 5000`, rendered data length ≤ original / 4 |
| 3 | Both series in legend | "Pitch (°)" and "Accel X (g)" labels visible |

### 3.4 `DiagnosticCard.test.tsx`

| # | Test | What to assert |
|---|------|----------------|
| 1 | Info severity — blue/gray border | Card renders; severity badge shows "info" |
| 2 | Warning severity — yellow border | Severity badge shows "warning" |
| 3 | Critical severity — red border | Severity badge shows "critical" |
| 4 | Title and message rendered | `note.title` and `note.message` text in DOM |
| 5 | Action text rendered | `note.action` text in DOM |

### 3.5 `BikeSelector.test.tsx`

| # | Test | What to assert |
|---|------|----------------|
| 1 | Renders placeholder when no bikes | "Select bike…" placeholder visible |
| 2 | Renders all bike names | One `<option>` per bike |
| 3 | Calls onChange with slug on select | `onChange` mock called with correct slug |
| 4 | Controlled value shown | Selected option matches `value` prop |

### 3.6 `Layout.test.tsx`

| # | Test | What to assert |
|---|------|----------------|
| 1 | Renders all nav items | "Import", "Calibrate", "Analyze", "Compare" links present |
| 2 | App title visible | "Suspension Study" text rendered |
| 3 | Active route highlighted | Current route link has active CSS class |
| 4 | Children rendered in content area | `{children}` content appears |

---

## 4. Page Integration Tests

Each page test wraps the component in `<QueryClientProvider>` + `<MemoryRouter>` and uses MSW for API interception.

### 4.1 `ImportPage.test.tsx`

| # | Test | What to assert |
|---|------|----------------|
| 1 | Page renders | Heading "Import Session" visible; all form fields rendered |
| 2 | Bike dropdown populated | T7 bike name appears in dropdown after API response |
| 3 | Import button disabled when fields empty | Button has `disabled` attribute with empty name/path/bike |
| 4 | Import button enables with required fields | Filling name, path, and selecting bike enables button |
| 5 | Successful import shows success message | "Session imported successfully" visible after submit |
| 6 | "Analyze Now" button appears after import | Button with text "Analyze Now" in DOM |
| 7 | API error shows error message | When MSW returns 400, error text appears in DOM |
| 8 | Column mapping inputs pre-filled with defaults | Default column names (front_raw, rear_raw, etc.) present |
| 9 | Invert checkboxes toggle | Clicking "Invert front" toggles checkbox state |
| 10 | Velocity quantity radio | Switching to "wheel" updates selection |

**Key MSW override for error test:**
```ts
server.use(
  http.post('.../sessions/import', () =>
    HttpResponse.json({ detail: 'File not found' }, { status: 400 }))
);
```

### 4.2 `CalibratePage.test.tsx`

| # | Test | What to assert |
|---|------|----------------|
| 1 | Page renders both calibration panels | "Front Fork Calibration" and "Rear Linkage Calibration" headings |
| 2 | Bike profile table renders | T7 bike name, slug, and parameters in table |
| 3 | Front Fit button disabled with empty rows | "Fit" disabled when all stroke/voltage fields empty |
| 4 | Front fit result shown | After filling 2 rows and clicking Fit, C_cal / V0 / RMSE values appear |
| 5 | Front Apply button appears after fit | "Apply" button visible after successful fit |
| 6 | Front Apply updates bike | PUT request sent with correct c_front / v0_front values |
| 7 | Rear fit result shown | a / b / c / RMSE values appear after rear fit |
| 8 | Add row button works | Clicking "+ Add row" increases table row count by 1 |
| 9 | New Profile button opens form | "New Bike Profile" form section appears |
| 10 | Save new bike calls POST | POST `/bikes` called with form data |
| 11 | Edit bike loads form | Clicking Edit pre-populates form with bike values |
| 12 | Delete bike prompts confirmation | `window.confirm` called; DELETE request sent on accept |
| 13 | Delete cancelled leaves bike | `window.confirm` returning false → no DELETE request |

### 4.3 `AnalyzePage.test.tsx`

| # | Test | What to assert |
|---|------|----------------|
| 1 | Page renders | "Analyze" heading; session dropdown present |
| 2 | Session dropdown populated | Session name from API appears in `<option>` |
| 3 | Analyze button disabled with no session | Button has `disabled` attribute |
| 4 | Analyze button enables on session select | Select a session → button becomes enabled |
| 5 | Clicking Analyze shows results | POST `/analyze/sess-1` called; charts appear |
| 6 | Front and rear travel histograms rendered | Two `TravelHistogram` sections visible |
| 7 | Front and rear velocity histograms rendered | Two `VelocityHistogram` sections visible |
| 8 | Pitch chart rendered | PitchChart heading or SVG present |
| 9 | No diagnostics → diagnostics section hidden | When `diagnostics: []`, no diagnostic cards |
| 10 | Diagnostics rendered and sorted | Critical before warning before info |
| 11 | Footer metadata shown | Duration, samples, session ID visible |
| 12 | API error shows error message | When POST returns 500, error text appears |
| 13 | URL param pre-selects session | `?session=sess-1` pre-selects session in dropdown |
| 14 | Re-analyze allowed | Clicking Analyze again re-issues POST |

**Diagnostic sort test setup:**
```ts
server.use(
  http.post('.../analyze/:id', () => HttpResponse.json({
    ...MOCK_RESULT,
    diagnostics: [
      { rule_id: 'r1', severity: 'info',     title: 'Info note',     message: '', action: '' },
      { rule_id: 'r2', severity: 'critical', title: 'Critical note', message: '', action: '' },
      { rule_id: 'r3', severity: 'warning',  title: 'Warning note',  message: '', action: '' },
    ],
  }))
);
// Assert: "Critical note" appears before "Warning note" before "Info note" in DOM
```

### 4.4 `ComparePage.test.tsx`

| # | Test | What to assert |
|---|------|----------------|
| 1 | Page renders | "Compare Sessions" heading; session checkboxes |
| 2 | No sessions shows prompt | "No sessions available. Import some first." |
| 3 | Sessions listed as checkboxes | Session name visible as checkbox label |
| 4 | Compare button disabled with 0/1 sessions | Disabled until ≥ 2 sessions selected |
| 5 | Selecting 2 sessions enables Compare | Button becomes enabled |
| 6 | Cannot select more than 3 sessions | 4th checkbox is disabled |
| 7 | Compare button calls API | POST `/compare` called with correct session IDs |
| 8 | Results render overlaid charts | Travel and velocity overlay charts appear |
| 9 | Session summary table rendered | Session names and statistics in table |
| 10 | Granularity toggle switches mode | Switching to "segment-level" shows duration input |
| 11 | Segment duration input updates request | Duration value sent in POST body |
| 12 | API error shown | When POST returns 400, error text visible |
| 13 | Deselecting a session removes it | Unchecking a checkbox removes it from selection |
| 14 | Session color dots shown | Color swatch dots appear next to selected sessions |

---

## 5. API Client Tests

### 5.1 `client.test.ts`

| # | Test | What to assert |
|---|------|----------------|
| 1 | Base URL set correctly | `client.defaults.baseURL === 'http://localhost:8000/api/v1'` |
| 2 | Timeout configured | `client.defaults.timeout === 30000` |
| 3 | Successful response passes through | Response data returned unchanged |
| 4 | 4xx error extracts `detail` field | Error message equals `response.data.detail` |
| 5 | 4xx error without `detail` uses `message` | Falls back to `err.message` |
| 6 | Network error propagated | Rejected Promise contains Error object |

---

## 6. Hook Tests

### 6.1 `useBikes.test.tsx`

Use `renderHook` from `@testing-library/react` with a `QueryClientProvider` wrapper.

| # | Test | What to assert |
|---|------|----------------|
| 1 | `useBikes` returns bikes from API | `result.current.data` contains T7 bike |
| 2 | `useCreateBike` calls POST | Mutation triggers POST request |
| 3 | `useUpdateBike` calls PUT | Mutation triggers PUT `/bikes/t7` |
| 4 | `useDeleteBike` calls DELETE | Mutation triggers DELETE `/bikes/t7` |

### 6.2 `useSessions.test.tsx`

| # | Test | What to assert |
|---|------|----------------|
| 1 | `useSessions` returns sessions | `result.current.data` contains mock session |
| 2 | `useImportSession` calls POST import | Mutation triggers POST `/sessions/import` |

---

## 7. Edge Case and Accessibility Tests

| # | Test | Area | What to assert |
|---|------|------|----------------|
| 1 | All form inputs have labels | Import, Calibrate | Every `<input>` has associated `<label>` |
| 2 | Error messages use ARIA roles | Import, Analyze | Error `<div>` has `role="alert"` or equivalent |
| 3 | Disabled buttons not keyboard-focusable | All pages | `disabled` attribute set |
| 4 | Charts render without crashing on empty bins | TravelHistogram | `time_pct` all zeros → no JS error |
| 5 | Long session names truncate gracefully | Compare | 80-character name does not overflow layout |

---

## 8. What Not to Test

- Recharts internal rendering details (axis tick coordinates, pixel positions)
- Tailwind class names (implementation detail — test behavior, not style)
- Internal state variables (test the rendered output, not `useState` values)
- `vite.config.ts` itself

---

## 9. Running the Tests

```bash
cd frontend

# Run all tests once
npm run test

# Watch mode (re-runs on file save)
npm run test:watch

# Coverage report
npm run test:coverage
```

Coverage target: **≥ 80%** on lines for all files under `src/pages/`, `src/components/`, and `src/api/`.

---

## 10. CI Integration

Add to the CI workflow after the backend test step:

```yaml
- name: Install frontend dependencies
  working-directory: frontend
  run: npm ci

- name: Run frontend tests
  working-directory: frontend
  run: npm run test

- name: Frontend build check
  working-directory: frontend
  run: npm run build
```

The test step must pass before the build step runs.

---

## 11. Implementation Order

Implement in this order to get value early and unblock the rest:

1. **Testing infrastructure** — install packages, write `setup.ts`, MSW `handlers.ts`, update `vite.config.ts`
2. **`DiagnosticCard.test.tsx`** — simplest component, no API, validates test setup works
3. **`TravelHistogram.test.tsx`** and **`VelocityHistogram.test.tsx`** — chart component smoke tests
4. **`BikeSelector.test.tsx`** — controlled component with onChange
5. **`ImportPage.test.tsx`** — most user-facing; validates happy path + error path
6. **`AnalyzePage.test.tsx`** — validates charts appear after analysis
7. **`CalibratePage.test.tsx`** — most complex page; do after the simpler pages pass
8. **`ComparePage.test.tsx`** — requires two sessions; do last
9. **Hook tests** — fill coverage gaps
10. **API client tests** — fill coverage gaps
