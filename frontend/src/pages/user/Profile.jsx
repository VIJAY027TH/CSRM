import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { User, Mail, Shield, CheckCircle, Calendar, Hash } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>My Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          User identification, credentials overview, role permissions, and access status
        </p>
      </div>

      <div className="grid-2">
        {/* Profile Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700
            }}>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.username}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <Hash size={16} />
                <span>Account ID</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>#{user?.id}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <Shield size={16} />
                <span>Assigned Role</span>
              </div>
              <span className={`user-pill-role role-badge-${user?.role}`} style={{ fontSize: '0.8rem', padding: '3px 8px' }}>
                {user?.role}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <CheckCircle size={16} />
                <span>Account Status</span>
              </div>
              <StatusBadge status={user?.status} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <Mail size={16} />
                <span>Email Address</span>
              </div>
              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Permissions & Security Summary */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '14px' }}>Role Permissions & Security</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            CSRM strictly enforces role-based access control (RBAC) at both API and database layers.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>🔐 Password Security</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Passwords are hashed via BCrypt with 10 salt rounds. Raw passwords are never transmitted or displayed in API responses.
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>🏷️ Booking Eligibility</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {user?.role === 'ADMIN' && 'Full administrative authority over users, resources, bookings, reports, and audit trails.'}
                {user?.role === 'FACULTY' && 'Authorized to book Classrooms, Auditoriums, Laboratories, and Media Equipment.'}
                {user?.role === 'STUDENT' && 'Authorized to reserve Smart Lockers, Research Labs, and Multimedia Equipment.'}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>⚡ Conflict Prevention</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Overlapping reservation requests are intercepted at the server level, preventing double bookings on any campus resource.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
