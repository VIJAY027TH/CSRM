import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Users,
  UserCheck,
  Layers,
  CalendarCheck,
  Calendar,
  AlertTriangle,
  Percent,
  XCircle,
  ArrowRight,
  ShieldCheck,
  FileBarChart
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Loading Campus Control Center metrics..." />;

  const getBarColor = (type) => {
    switch (type) {
      case 'CLASSROOM': return 'var(--deep-sage)';
      case 'LAB': return 'var(--dark-sage)';
      case 'LOCKER': return 'var(--warm-amber)';
      case 'EQUIPMENT': return 'var(--primary-sage)';
      default: return 'var(--deep-sage)';
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Campus Control Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Overview of campus resources, bookings, approvals, and activity
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/admin/reports" className="btn btn-secondary">
            <FileBarChart size={16} />
            <span>Reports</span>
          </Link>
          <Link to="/admin/audit" className="btn btn-primary">
            <ShieldCheck size={16} />
            <span>Audit Logs</span>
          </Link>
        </div>
      </div>

      {/* Pending Approval Alert (Warm Amber) */}
      {stats?.pendingUsers > 0 && (
        <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="var(--dark-amber)" />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Action Required</strong>
              <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                {stats.pendingUsers} account registration{stats.pendingUsers > 1 ? 's are' : ' is'} awaiting administrative review.
              </div>
            </div>
          </div>
          <Link to="/admin/users" className="btn btn-warning btn-sm">
            Review Pending Users
          </Link>
        </div>
      )}

      {/* 8 Metric Cards with Warm/Sage palette */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-sage">
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-amber">
            <UserCheck size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.pendingUsers || 0}</div>
            <div className="stat-label">Pending Approvals</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-sage">
            <Layers size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalResources || 0}</div>
            <div className="stat-label">Total Resources</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-sage">
            <CalendarCheck size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.activeBookings || 0}</div>
            <div className="stat-label">Active Bookings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-neutral">
            <Calendar size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.todayBookings || 0}</div>
            <div className="stat-label">Today's Bookings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-red">
            <XCircle size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.cancelledBookings || 0}</div>
            <div className="stat-label">Cancelled Bookings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-amber">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.bookingConflicts || 0}</div>
            <div className="stat-label">Booking Conflicts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-sage">
            <Percent size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.resourceUtilization || 0}%</div>
            <div className="stat-label">Resource Utilization</div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Resources by Type & Bookings by Resource Type */}
      <div className="grid-2">
        {/* Left: Campus Resources by Type */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Campus Resources by Type</h2>
              <p className="card-subtitle">Distribution of classrooms, labs, lockers, and equipment</p>
            </div>
            <Link to="/admin/resources" className="btn btn-secondary btn-sm">
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(stats?.resourcesByType || {}).map(([type, count]) => {
              const total = stats?.totalResources || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{type}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: getBarColor(type),
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Bookings by Resource Type */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Bookings by Resource Type</h2>
              <p className="card-subtitle">Volume of reservations across campus facility categories</p>
            </div>
            <Link to="/admin/bookings" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(stats?.bookingsByType || {}).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No bookings recorded yet.</p>
            ) : (
              Object.entries(stats?.bookingsByType || {}).map(([type, count]) => (
                <div key={type} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)'
                }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{type}</span>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: 'var(--deep-sage)',
                    background: 'var(--bg-surface-soft)',
                    padding: '3px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--sage-border)'
                  }}>
                    {count} bookings
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
