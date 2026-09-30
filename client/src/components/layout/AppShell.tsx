/**
 * AppShell — Main authenticated layout with sidebar + topbar + mobile nav.
 * All authenticated pages render inside this shell.
 */

import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Map,
  BrainCircuit,
  FileText,
  ShieldAlert,
  LogOut,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  matchPrefix?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',    label: 'Overview',        icon: LayoutDashboard },
  { to: '/roadmap/start',label: 'My Roadmap',      icon: Map,             matchPrefix: '/roadmap' },
  { to: '/setup',        label: 'Mock Interviews',  icon: BrainCircuit,    matchPrefix: '/setup' },
  { to: '/admin',        label: 'Admin Panel',      icon: ShieldAlert,     adminOnly: true },
];

function NavLink({ item }: { item: NavItem }) {
  const location = useLocation();
  const prefix = item.matchPrefix ?? item.to;
  const isActive = location.pathname === item.to ||
    (item.matchPrefix ? location.pathname.startsWith(item.matchPrefix) : false);
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={`nav-item ${isActive ? 'active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="nav-icon">
        <Icon size={16} />
      </span>
      <span>{item.label}</span>
    </Link>
  );
}

interface AppShellProps {
  children: ReactNode;
  pageTitle?: string;
}

export function AppShell({ children, pageTitle }: AppShellProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  // Derive a page title from the current path
  const currentNav = NAV_ITEMS.find((item) => {
    const prefix = item.matchPrefix ?? item.to;
    return location.pathname === item.to ||
      (item.matchPrefix ? location.pathname.startsWith(item.matchPrefix) : false);
  });
  const resolvedTitle = pageTitle ?? currentNav?.label ?? 'Career R&I';

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <div className="app-shell">
      {/* ── Sidebar (desktop) ── */}
      <aside className="app-sidebar" aria-label="Primary navigation">
        {/* Brand */}
        <div style={{ padding: '20px 16px 12px' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(128,103,232,0.35)',
              }}
            >
              <BrainCircuit size={18} color="#fff" />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: 'var(--text)',
                letterSpacing: '-0.2px',
              }}
            >
              Career R&amp;I
            </span>
          </Link>
        </div>

        <div style={{ padding: '0 10px' }}>
          {/* Divider */}
          <div className="divider" style={{ margin: '4px 0 12px' }} />

          {/* Nav label */}
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0 6px',
              marginBottom: 6,
            }}
          >
            Navigation
          </p>

          {/* Nav items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {visibleNavItems.map((item) => (
              <NavLink key={item.to} item={item} />
            ))}
          </nav>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User section */}
        <div
          style={{
            padding: '12px 10px 16px',
            borderTop: '1px solid var(--border)',
          }}
        >
          {/* User card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'var(--surface-muted)',
              marginBottom: 8,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--primary-text)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name}
              </p>
              {user?.role === 'admin' && (
                <span className="badge badge-warning" style={{ fontSize: 10, padding: '1px 6px' }}>
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="nav-item"
            style={{ width: '100%', border: 'none', background: 'transparent' }}
          >
            <span className="nav-icon">
              <LogOut size={15} />
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="app-main">
        {/* Top bar */}
        <header className="app-topbar">
          {/* Left: page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
              {resolvedTitle}
            </h1>
          </div>

          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Notification bell */}
            <button
              aria-label="Notifications"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface-solid)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Bell size={16} />
            </button>

            {/* Avatar (mobile visible) */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--primary-text)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title={user?.name}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="app-content">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const prefix = item.matchPrefix ?? item.to;
          const isActive =
            location.pathname === item.to ||
            (item.matchPrefix
              ? location.pathname.startsWith(item.matchPrefix)
              : false);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="mobile-nav-item"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          aria-label="Sign out"
        >
          <LogOut size={20} />
          <span>Out</span>
        </button>
      </nav>
    </div>
  );
}
