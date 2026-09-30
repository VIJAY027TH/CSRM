import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  CalendarCheck,
  Edit2,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Filter,
  MapPin,
  User
} from 'lucide-react';

export const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('');

  // Admin Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editStatus, setEditStatus] = useState('CONFIRMED');
  const [editPurpose, setEditPurpose] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllBookings();
      // Deterministic ordering: newest created booking first (createdAt DESC)
      const sorted = (data || []).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        return (b.id || 0) - (a.id || 0);
      });
      setBookings(sorted);
    } catch (err) {
      setErrorMsg('Failed to load campus bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openEditModal = (b) => {
    setSelectedBooking(b);
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);

    setEditDate(start.toISOString().split('T')[0]);
    setEditStart(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`);
    setEditEnd(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
    setEditStatus(b.status);
    setEditPurpose(b.purpose || '');
    setEditError('');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setSaving(true);

    try {
      const newStart = `${editDate}T${editStart}:00`;
      const newEnd = `${editDate}T${editEnd}:00`;

      if (new Date(newEnd) <= new Date(newStart)) {
        setEditError('End time must be after start time.');
        setSaving(false);
        return;
      }

      await adminService.updateBooking(selectedBooking.id, {
        startTime: newStart,
        endTime: newEnd,
        status: editStatus,
        purpose: editPurpose
      });

      setSuccessMsg(`Booking #${selectedBooking.id} updated successfully.`);
      setEditModalOpen(false);
      fetchBookings();
    } catch (err) {
      setEditError(err.friendlyMessage || 'Failed to update booking. Conflicting reservation detected.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async (b) => {
    if (!window.confirm(`Are you sure you want to cancel booking #${b.id} for ${b.resourceName}?`)) return;

    try {
      await adminService.cancelBooking(b.id);
      setSuccessMsg(`Booking #${b.id} was cancelled by administrator.`);
      fetchBookings();
    } catch (err) {
      setErrorMsg(err.friendlyMessage || 'Failed to cancel booking.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading all campus bookings..." />;

  const filteredBookings = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false;
    return true;
  });

  // Admin All Bookings: newest created booking first (createdAt DESC)
  const displayedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (dateB !== dateA) return dateB - dateA;
    return (b.id || 0) - (a.id || 0);
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            All Bookings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Comprehensive overview and administrative override control for all campus reservations
          </p>
        </div>

        <div>
          <select
            className="form-control"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses ({bookings.length})</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <div>{successMsg}</div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Reserved By</th>
                <th>Resource</th>
                <th>Schedule Window</th>
                <th>Status</th>
                <th>Purpose</th>
                <th>Created</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedBookings.map((b) => {
                const startDate = new Date(b.startTime);
                const endDate = new Date(b.endTime);
                const isCancelled = b.status === 'CANCELLED';

                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{b.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} color="var(--deep-sage)" />
                        <span>{b.username}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1px' }}>{b.userEmail}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{b.resourceName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        [{b.resourceType}] {b.location}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td style={{ fontSize: '0.85rem', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={b.purpose}>
                      {b.purpose || '—'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(b)}
                          className="btn btn-secondary btn-sm"
                          title="Admin Edit"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleCancelBooking(b)}
                          disabled={isCancelled}
                          className="btn btn-secondary btn-sm"
                          title="Admin Cancel"
                          style={{ opacity: isCancelled ? 0.4 : 1, color: isCancelled ? 'var(--text-muted)' : 'var(--danger)' }}
                        >
                          <XCircle size={13} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedBooking ? `Administrative Edit: Booking #${selectedBooking.id}` : 'Edit Booking'}
      >
        {selectedBooking && (
          <form onSubmit={handleEditSubmit}>
            {editError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                <div>{editError}</div>
              </div>
            )}

            <div style={{ padding: '14px 18px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.85rem' }}>
              <div><strong>User:</strong> {selectedBooking.username} ({selectedBooking.userEmail})</div>
              <div><strong>Resource:</strong> {selectedBooking.resourceName} ({selectedBooking.location})</div>
            </div>

            <div className="form-group">
              <label className="form-label">Reservation Date</label>
              <input
                type="date"
                className="form-control"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status Override</label>
              <select
                className="form-control"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                required
              >
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PENDING">PENDING</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Purpose</label>
              <textarea
                className="form-control"
                value={editPurpose}
                onChange={(e) => setEditPurpose(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Validating Conflicts...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
