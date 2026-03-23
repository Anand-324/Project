import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useAppContext';

const NAV = [
  { to: '/',          icon: '⊞', label: 'Dashboard' },
  { to: '/profile',   icon: '◎', label: 'Profile Setup' },
  { to: '/aptitude',  icon: '⊙', label: 'Aptitude Test' },
  { to: '/coding',    icon: '⌥', label: 'Coding Test' },
  { to: '/interview', icon: '◈', label: 'HR Interview', badge: 'AI' },
  { to: '/results',   icon: '◇', label: 'Results & SHAP' },
];

const ADMIN_NAV = [
  { to: '/admin',     icon: '◆', label: 'Admin Panel' },
  { to: '/recruiter', icon: '⬡', label: 'Recruiter View' },
];

export default function Sidebar() {
  const { profile, completed } = useApp();
  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <nav className="sidebar">
      <div className="logo">
        <div className="logo-icon">AI</div>
        <span className="logo-text">InterviewAI</span>
      </div>

      <div className="nav-section" style={{ marginBottom: 8 }}>Menu</div>
      {NAV.map(({ to, icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="icon">{icon}</span>
          {label}
          {badge && <span className="nav-badge">{badge}</span>}
        </NavLink>
      ))}

      <div className="nav-section" style={{ marginTop: 20, marginBottom: 8 }}>Admin</div>
      {ADMIN_NAV.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="icon">{icon}</span>
          {label}
        </NavLink>
      ))}

      <div className="sidebar-bottom">
        <div className="user-row">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <p>{profile.name}</p>
            <span>Candidate</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
