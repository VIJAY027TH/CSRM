import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import {
  FileBarChart,
  Percent,
  AlertTriangle,
  UserCheck,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('utilization');
  const [utilizationData, setUtilizationData] = useState([]);
  const [conflictsData, setConflictsData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [util, conflicts, activity] = await Promise.all([
          adminService.getUtilizationReport(),
          adminService.getConflictReport(),
          adminService.getUserActivityReport()
        ]);
        setUtilizationData(util || []);
        setConflictsData(conflicts || []);
        setUserActivityData(activity || []);
      } catch (err) {
        console.error('Error loading reports', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner message="Generating real-time reports and analytics from database..." />;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Reports & Analytical Intelligence
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Data-driven insights into campus resource occupancy, user reservation patterns, and conflict occurrences
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('utilization')}
          className={`btn ${activeTab === 'utilization' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Percent size={16} />
          <span>Resource Utilization ({utilizationData.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`btn ${activeTab === 'conflicts' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <AlertTriangle size={16} />
          <span>Prevented Conflicts ({conflictsData.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <UserCheck size={16} />
          <span>User Engagement ({userActivityData.length})</span>
        </button>
      </div>

      {/* TAB 1: RESOURCE UTILIZATION */}
      {activeTab === 'utilization' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Campus Facility Utilization Rate</h2>
              <p className="card-subtitle">
                Calculated occupancy percentages and total hours booked based on actual database bookings
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Facility Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Total Reservations</th>
                  <th>Total Hours Reserved</th>
                  <th>Utilization Rate</th>
                  <th>Occupancy Visual</th>
                </tr>
              </thead>
              <tbody>
                {utilizationData.map(u => (
                  <tr key={u.resourceId}>
                    <td style={{ fontWeight: 600 }}>{u.resourceName}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'var(--bg-surface)', borderRadius: '4px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {u.resourceType}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.location}</td>
                    <td style={{ fontWeight: 600 }}>{u.totalBookings}</td>
                    <td>{u.totalHoursBooked} hrs</td>
                    <td style={{ fontWeight: 700, color: u.utilizationPercent > 30 ? 'var(--deep-sage)' : 'var(--text-secondary)' }}>
                      {u.utilizationPercent}%
                    </td>
                    <td style={{ minWidth: '120px' }}>
                      <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(u.utilizationPercent, 2))}%`,
                          background: u.utilizationPercent > 50 ? 'var(--deep-sage)' : u.utilizationPercent > 20 ? 'var(--warm-amber)' : 'var(--border)',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONFLICT DETECTION LOG */}
      {activeTab === 'conflicts' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Booking Conflict Prevention Log</h2>
              <p className="card-subtitle">
                Real-time audit log of double-booking attempts successfully blocked by the backend conflict query
              </p>
            </div>
          </div>

          {conflictsData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <AlertTriangle size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h3>No conflicts detected yet</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>When users attempt to book overlapping time slots, those events are automatically logged here.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Log #</th>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Conflict Event</th>
                    <th>Audit Details</th>
                  </tr>
                </thead>
                <tbody>
                  {conflictsData.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{c.id}</td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(c.timestamp).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{c.attemptedBy}</td>
                      <td>
                        <span className="badge badge-CANCELLED">HTTP 409 Conflict</span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                        {c.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">User Activity & Reservation Metrics</h2>
              <p className="card-subtitle">
                Individual user engagement, booking frequency, and last recorded campus action
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Total Reservations</th>
                  <th>Active Bookings</th>
                  <th>Cancelled</th>
                  <th>Last Recorded Action</th>
                </tr>
              </thead>
              <tbody>
                {userActivityData.map(u => (
                  <tr key={u.userId}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{u.userId}</td>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td>
                      <span className={`user-pill-role role-badge-${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td style={{ fontWeight: 600 }}>{u.totalBookings}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{u.activeBookings}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{u.cancelledBookings}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(u.lastActionTime).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
