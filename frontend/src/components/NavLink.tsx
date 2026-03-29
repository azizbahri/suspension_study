import { NavLink as RouterNavLink } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
}

export default function NavLink({ to, icon, label, expanded }: NavLinkProps) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium whitespace-nowrap overflow-hidden ${
          isActive
            ? 'bg-orange-500 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`
      }
    >
      <span className="flex-shrink-0 w-5 h-5">{icon}</span>
      {expanded && <span>{label}</span>}
    </RouterNavLink>
  );
}
