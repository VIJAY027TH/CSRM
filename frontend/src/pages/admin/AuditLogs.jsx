import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  RefreshCw
} from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (startDate) params.startDate = `${startDate}T00:00:00`;
      if (endDate) params.endDate = `${endDate}T23:59:59`;

      const data = await adminService.getAuditLogs(params);
      let filtered = data || [];
      if (userQuery) {
        filtered = filtered.filter(l =>
          (l.username && l.username.toLowerCase().includes(userQuery.toLowerCase())) ||
          (l.userId && l.userId.toString() === userQuery)
        );
      }
      setLogs(filtered);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('CREATED') || action.includes('APPROVED')) return 'var(--primary-sage)';
    if (action.includes('MODIFIED') || action.includes('UPDATED')) return 'var(--dark-sage)';
    if (action.includes('CANCELLED') || action.includes('REJECTED') || action.includes('DELETED')) return 'var(--danger)';
    if (action.includes('CONFLICT')) return 'var(--warm-amber)';
    return 'var(--text-secondary)';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Audit Trail & Logs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            System-level immutable audit records for bookings, resource modifications, and user approvals
          </p>
        </div>

        <button onClick={fetchLogs} className="btn btn-secondary">
          <RefreshCw size={15} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label">Search Username / ID</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. admin, student"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <label className="form-label">Action Filter</label>
            <select
              className="form-control"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="BOOKING_CREATED">BOOKING_CREATED</option>
              <option value="BOOKING_MODIFIED">BOOKING_MODIFIED</option>
              <option value="BOOKING_CANCELLED">BOOKING_CANCELLED</option>
              <option value="BOOKING_CONFLICT_ATTEMPT">BOOKING_CONFLICT_ATTEMPT</option>
              <option value="USER_APPROVED">USER_APPROVED</option>
              <option value="USER_REJECTED">USER_REJECTED</option>
              <option value="USER_STATUS_UPDATED">USER_STATUS_UPDATED</option>
              <option value="USER_REGISTERED">USER_REGISTERED</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="RESOURCE_CREATED">RESOURCE_CREATED</option>
              <option value="RESOURCE_UPDATED">RESOURCE_UPDATED</option>
              <option value="RESOURCE_DELETED">RESOURCE_DELETED</option>
            </select>
          </div>

          <div style={{ minWidth: '140px' }}>
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '140px' }}>
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div style={{ alignSelf: 'flex-end', marginBottom: '2px' }}>
            <button type="submit" className="btn btn-primary">
              <Filter size={15} />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Querying audit records..." />
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3>No audit records found</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Try loosening your filter parameters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Timestamp</th>
                  <th>Actor / User</th>
                  <th>Action Event</th>
                  <th>Activity Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{log.id}</td>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} color="var(--primary)" />
                        <span>{log.username || 'System'}</span>
                        {log.userId && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(#{log.userId})</span>}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        color: '#ffffff',
                        background: getActionBadgeColor(log.action),
                        display: 'inline-block'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
