import { SectionCard } from '../components/SectionCard'

type PlaceholderWorkspaceProps = {
  title: string
  eyebrow: string
  description: string
  readinessLabel: string
  checklist: string[]
}

export function PlaceholderWorkspace({
  title,
  eyebrow,
  description,
  readinessLabel,
  checklist,
}: PlaceholderWorkspaceProps) {
  return (
    <div className="workspace-stack">
      <SectionCard title={title} eyebrow={eyebrow} description={description}>
        <div className="placeholder-block">
          <p className="eyebrow">Readiness gate</p>
          <h3>{readinessLabel}</h3>
          <ul className="plain-list">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </SectionCard>
    </div>
  )
}