import { Outlet, NavLink } from 'react-router-dom';
import { Home, FileText, BookOpen, Users, BarChart2, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/documents', icon: FileText, label: 'Docs' },
  { to: '/ledger', icon: BookOpen, label: 'Ledger' },
  { to: '/directory', icon: Users, label: 'Directory' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors',
                isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
