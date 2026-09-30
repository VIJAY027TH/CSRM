import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Landmark, LogIn, AlertCircle, ShieldCheck, Calendar, Sparkles } from 'lucide-react';

export const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(usernameOrEmail, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Invalid credentials or account issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      background: 'var(--bg-page)'
    }}>
      <div style={{
        maxWidth: '960px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '32px',
        alignItems: 'center'
      }}>
        {/* Left Side: Brand & Value Proposition */}
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px',
            background: 'var(--bg-surface-soft)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--sage-border)',
            color: 'var(--deep-sage)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            <Sparkles size={14} />
            <span>Academic Resource Management</span>
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '16px'
          }}>
            Campus resources, <br />
            <span style={{ color: 'var(--deep-sage)' }}>simplified.</span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            lineHeight: 1.6,
            marginBottom: '32px'
          }}>
            Centralized conflict-free booking for university classrooms, research laboratories, smart RFID lockers, and multimedia equipment.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--bg-surface-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--deep-sage)'
              }}>
                <Calendar size={16} />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
                Automated conflict detection prevents double bookings
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--amber-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--dark-amber)'
              }}>
                <ShieldCheck size={16} />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
                Role-based access control for students, faculty & administrators
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="card" style={{ padding: '36px', margin: 0, boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--bg-surface-soft)',
              color: 'var(--deep-sage)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Landmark size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                Sign in to CSRM
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Access campus facility portal
              </p>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. admin or faculty@csrm.com"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '6px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--deep-sage)', fontWeight: 600, textDecoration: 'none' }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
