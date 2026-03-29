import type { DiagnosticNote } from '../types/analysis';

const SEVERITY_STYLES: Record<DiagnosticNote['severity'], string> = {
  info: 'border-gray-400 bg-gray-50',
  warning: 'border-yellow-400 bg-yellow-50',
  critical: 'border-red-500 bg-red-50',
};

const SEVERITY_BADGE: Record<DiagnosticNote['severity'], string> = {
  info: 'bg-gray-200 text-gray-700',
  warning: 'bg-yellow-200 text-yellow-800',
  critical: 'bg-red-200 text-red-800',
};

const SEVERITY_ICON: Record<DiagnosticNote['severity'], string> = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🔴',
};

interface Props {
  note: DiagnosticNote;
}

export default function DiagnosticCard({ note }: Props) {
  return (
    <div className={`border-l-4 rounded-lg p-4 ${SEVERITY_STYLES[note.severity]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{SEVERITY_ICON[note.severity]}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${SEVERITY_BADGE[note.severity]}`}>
          {note.severity}
        </span>
        <span className="font-semibold text-sm text-gray-900">{note.title}</span>
      </div>
      <p className="text-sm text-gray-700 mb-1">{note.message}</p>
      <p className="text-xs text-gray-500 italic">{note.action}</p>
    </div>
  );
}
