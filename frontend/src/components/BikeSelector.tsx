import type { BikeProfile } from '../types/bike';

interface BikeSelectorProps {
  bikes: BikeProfile[];
  value: string;
  onChange: (slug: string) => void;
  className?: string;
}

export default function BikeSelector({ bikes, value, onChange, className = '' }: BikeSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${className}`}
    >
      <option value="">Select bike profile…</option>
      {bikes.map((b) => (
        <option key={b.slug} value={b.slug}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
