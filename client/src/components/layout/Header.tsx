import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, Map, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/setup', label: 'Mock Interview', icon: BrainCircuit },
    { to: '/roadmap/start', label: 'Career Roadmap', icon: Map },
  ] : [
    { to: '/setup', label: 'Mock Interview', icon: BrainCircuit },
    { to: '/roadmap/start', label: 'Career Roadmap', icon: Map },
  ];

  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-text-primary hover:text-accent-light transition-colors group">
          <div className="p-1.5 rounded-lg bg-accent-glow group-hover:bg-accent/20 transition-colors">
            <BrainCircuit size={22} className="text-accent" />
          </div>
          <span className="font-bold text-lg tracking-tight">Career R&I</span>
        </Link>
        
        <nav className="hidden sm:flex items-center gap-1 text-sm font-medium">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to.split('?')[0]) && to !== '/';
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-accent-glow text-accent-light border border-accent/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
          <div className="w-px h-6 bg-border mx-2"></div>
          {user ? (
            <Button variant="ghost" size="sm" onClick={logout} leftIcon={<LogOut size={15} />}>
              Logout
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

