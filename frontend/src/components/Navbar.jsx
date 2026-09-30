import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Landmark, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-brand-icon">
          <Landmark size={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.1, color: 'var(--text-main)' }}>CSRM</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Campus Smart Resources</span>
        </div>
        <span className="navbar-badge" style={{ marginLeft: '6px' }}>v1.0</span>
      </Link>

      <nav className="navbar-nav">
        {isAuthenticated ? (
          <>
            <NotificationDropdown />

            <div className="user-pill">
              <UserIcon size={14} color="var(--text-secondary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.username}</span>
              <span className={`user-pill-role role-badge-${user?.role}`}>
                {user?.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{
                color: 'var(--danger)',
                borderColor: 'var(--border)',
                padding: '6px 12px'
              }}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        )}
      </nav>
    </header>
  );
};
