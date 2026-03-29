import { useState } from 'react';
import { Upload, Sliders, BarChart2, GitCompare, Bike } from 'lucide-react';
import NavLink from './NavLink';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-gray-950 transition-all duration-200 ${
          expanded ? 'w-60' : 'w-16'
        } flex-shrink-0`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800 overflow-hidden">
          <Bike className="w-6 h-6 text-orange-500 flex-shrink-0" />
          {expanded && (
            <span className="text-white font-semibold text-sm whitespace-nowrap">
              Suspension Study
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-2 flex-1">
          <NavLink to="/import" icon={<Upload size={18} />} label="Import" expanded={expanded} />
          <NavLink to="/calibrate" icon={<Sliders size={18} />} label="Calibrate" expanded={expanded} />
          <NavLink to="/analyze" icon={<BarChart2 size={18} />} label="Analyze" expanded={expanded} />
          <NavLink to="/compare" icon={<GitCompare size={18} />} label="Compare" expanded={expanded} />
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
