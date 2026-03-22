export type NavItem = {
  path: string
  label: string
  step: string
}

export const navItems: NavItem[] = [
  { path: '/', label: 'Import', step: '01' },
  { path: '/calibration', label: 'Calibration', step: '02' },
  { path: '/analysis', label: 'Analysis', step: '03' },
  { path: '/compare', label: 'Compare', step: '04' },
  { path: '/session-details', label: 'Session details', step: '05' },
]