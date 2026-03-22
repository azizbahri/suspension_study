type BadgeProps = {
  label: string
  tone: 'valid' | 'warning' | 'danger' | 'muted'
}

export function Badge({ label, tone }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{label}</span>
}