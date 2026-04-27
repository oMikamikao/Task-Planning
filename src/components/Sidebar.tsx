import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';

interface SidebarProps {
  collapsed?: boolean;
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    color: '#F59E0B',
  },
  {
    label: 'Tasks',
    path: '/tasks',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    color: '#8B5CF6',
  },
  {
    label: 'Events',
    path: '/events',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    color: '#06B6D4',
  },
];

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  return (
    <aside
      className="sidebar-glass fixed left-0 top-0 h-full z-40 flex flex-col"
      style={{
        width: collapsed ? '0' : '220px',
        minWidth: collapsed ? '0' : '220px',
        transition: 'width 0.3s ease, min-width 0.3s ease',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1
          className="text-xl font-bold text-dark tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          星·语
        </h1>
        <p className="text-xs text-muted-light mt-0.5">Task Manager</p>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-2" />

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                isActive ? 'active text-dark' : 'text-muted-light'
              }`}
            >
              <span style={{ color: isActive ? item.color : 'currentColor' }}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: item.color, boxShadow: `0 0 6px ${item.color}66` }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 flex-shrink-0">
        <div className="glass-panel p-3">
          <p className="text-xs text-muted-light text-center">星·语 v1.0</p>
        </div>
      </div>
    </aside>
  );
}
