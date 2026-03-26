import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/express', label: 'Express', icon: ExprIcon },
  { to: '/reflect', label: 'Reflect', icon: ReflectIcon },
  { to: '/echoes', label: 'Echoes', icon: EchoIcon },
  { to: '/canvas', label: 'Canvas', icon: CanvasIcon },
];

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-aura-amber'
                  : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            <Icon />
            <span className="text-[10px] font-medium tracking-wide">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function ExprIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function ReflectIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function EchoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CanvasIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
