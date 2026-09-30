import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Calendar,
  Clock,
  MapPin,
  Edit2,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Plus,
  Eye,
  CalendarCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active filter tab: 'ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modify Modal state
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modifyDate, setModifyDate] = useState('');
  const [modifyStartTime, setModifyStartTime] = useState('');
  const [modifyEndTime, setModifyEndTime] = useState('');
  const [modifyPurpose, setModifyPurpose] = useState('');
  const [modifying, setModifying] = useState(false);
  const [modifyError, setModifyError] = useState('');

  // Cancel Confirmation Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // View Details Modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      // Defensive sort: newest created first (createdAt DESC)
      const sorted = (data || []).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        return (b.id || 0) - (a.id || 0);
      });
      setBookings(sorted);
    } catch (err) {
      setErrorMsg('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openModifyModal = (booking) => {
    setSelectedBooking(booking);
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);

    const dateStr = start.toISOString().split('T')[0];
    const startHours = String(start.getHours()).padStart(2, '0');
    const startMins = String(start.getMinutes()).padStart(2, '0');
    const endHours = String(end.getHours()).padStart(2, '0');
    const endMins = String(end.getMinutes()).padStart(2, '0');

    setModifyDate(dateStr);
    setModifyStartTime(`${startHours}:${startMins}`);
    setModifyEndTime(`${endHours}:${endMins}`);
    setModifyPurpose(booking.purpose || '');
    setModifyError('');
    setModifyModalOpen(true);
  };

  const handleModifySubmit = async (e) => {
    e.preventDefault();
    setModifyError('');
    setModifying(true);

    try {
      const newStart = `${modifyDate}T${modifyStartTime}:00`;
      const newEnd = `${modifyDate}T${modifyEndTime}:00`;

      if (new Date(newEnd) <= new Date(newStart)) {
        setModifyError('End time must be after start time.');
        setModifying(false);
        return;
      }

      await bookingService.updateBooking(selectedBooking.id, {
        startTime: newStart,
        endTime: newEnd,
        purpose: modifyPurpose
      });

      setSuccessMsg('Booking modified successfully! Conflict detection verified.');
      setModifyModalOpen(false);
      fetchBookings();
    } catch (err) {
      setModifyError(err.friendlyMessage || 'Failed to modify booking. Slot may conflict.');
    } finally {
      setModifying(false);
    }
  };

  const openCancelModal = (booking) => {
    setCancellingBooking(booking);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancellingBooking) return;
    setCancelling(true);

    try {
      await bookingService.cancelBooking(cancellingBooking.id);
      setSuccessMsg(`Booking for ${cancellingBooking.resourceName} was cancelled successfully. The slot is now available again.`);
      setCancelModalOpen(false);
      fetchBookings();
    } catch (err) {
      setErrorMsg(err.friendlyMessage || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const openDetailsModal = (booking) => {
    setViewingBooking(booking);
    setDetailsModalOpen(true);
  };

  if (loading) return <LoadingSpinner message="Fetching your bookings..." />;

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'UPCOMING') {
      return (b.status === 'CONFIRMED' || b.status === 'PENDING') && new Date(b.startTime) > new Date();
    }
    if (statusFilter === 'ACTIVE') {
      return b.status === 'CONFIRMED' || b.status === 'PENDING';
    }
    if (statusFilter === 'COMPLETED') {
      return b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.endTime) < new Date());
    }
    if (statusFilter === 'CANCELLED') {
      return b.status === 'CANCELLED';
    }
    return true;
  });

  // Deterministic ordering: UPCOMING uses startTime ASC, all others use createdAt DESC
  const displayedBookings = [...filteredBookings].sort((a, b) => {
    if (statusFilter === 'UPCOMING') {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return (a.id || 0) - (b.id || 0);
    }
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
            My Bookings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Review, modify or cancel your scheduled campus reservations
          </p>
        </div>

        <Link to="/calendar" className="btn btn-primary">
          <Plus size={16} />
          <span>Book Resource</span>
        </Link>
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

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
        {['ALL', 'ACTIVE', 'UPCOMING', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`btn btn-sm ${statusFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
          >
            {tab === 'ALL' ? `All (${bookings.length})` : tab}
          </button>
        ))}
      </div>

      <div className="card">
        {displayedBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
            <CalendarCheck size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
            <h3 style={{ color: 'var(--text-main)' }}>No bookings match this filter</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {statusFilter === 'ALL' ? "You haven't made any campus bookings yet." : `No ${statusFilter.toLowerCase()} reservations found.`}
            </p>
            <Link to="/resources" className="btn btn-primary btn-sm" style={{ marginTop: '18px' }}>
              Browse Available Facilities
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Resource</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Purpose</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedBookings.map((b) => {
                  const isCancelled = b.status === 'CANCELLED';
                  const startDate = new Date(b.startTime);
                  const endDate = new Date(b.endTime);

                  return (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{b.id}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{b.resourceName}</td>
                      <td>
                        <span style={{ fontSize: '0.78rem', padding: '2px 8px', background: 'var(--bg-surface)', borderRadius: '4px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {b.resourceType}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="var(--deep-sage)" />
                          <span>{b.location}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={b.purpose}>
                        {b.purpose || '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => openDetailsModal(b)}
                            className="btn btn-secondary btn-sm"
                            title="View Details"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() => openModifyModal(b)}
                            disabled={isCancelled}
                            className="btn btn-secondary btn-sm"
                            title={isCancelled ? 'Cancelled bookings cannot be modified' : 'Modify schedule'}
                            style={{ opacity: isCancelled ? 0.4 : 1 }}
                          >
                            <Edit2 size={13} />
                            <span>Modify</span>
                          </button>

                          <button
                            onClick={() => openCancelModal(b)}
                            disabled={isCancelled}
                            className="btn btn-secondary btn-sm"
                            title={isCancelled ? 'Already cancelled' : 'Cancel this reservation'}
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
        )}
      </div>

      {/* View Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={viewingBooking ? `Reservation Details: #${viewingBooking.id}` : 'Reservation Details'}
      >
        {viewingBooking && (
          <div>
            <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: '18px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Facility:</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{viewingBooking.resourceName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Type & Location:</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{viewingBooking.resourceType} &bull; {viewingBooking.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reservation Window:</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {new Date(viewingBooking.startTime).toLocaleDateString()} ({new Date(viewingBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(viewingBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Booking Status:</span>
                <StatusBadge status={viewingBooking.status} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Purpose / Notes</label>
              <div style={{ padding: '12px 14px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                {viewingBooking.purpose || 'No special academic notes recorded.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDetailsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modify Booking Modal */}
      <Modal
        isOpen={modifyModalOpen}
        onClose={() => setModifyModalOpen(false)}
        title={selectedBooking ? `Modify Booking #${selectedBooking.id}` : 'Modify Booking'}
      >
        {selectedBooking && (
          <form onSubmit={handleModifySubmit}>
            {modifyError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                <div>{modifyError}</div>
              </div>
            )}

            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.85rem' }}>
              <div><strong>Facility:</strong> {selectedBooking.resourceName} ({selectedBooking.resourceType})</div>
              <div><strong>Location:</strong> {selectedBooking.location}</div>
            </div>

            <div className="form-group">
              <label className="form-label">New Reservation Date</label>
              <input
                type="date"
                className="form-control"
                min={new Date().toISOString().split('T')[0]}
                value={modifyDate}
                onChange={(e) => setModifyDate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={modifyStartTime}
                  onChange={(e) => setModifyStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={modifyEndTime}
                  onChange={(e) => setModifyEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Academic Purpose</label>
              <textarea
                className="form-control"
                value={modifyPurpose}
                onChange={(e) => setModifyPurpose(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModifyModalOpen(false)}
                disabled={modifying}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={modifying}
              >
                {modifying ? 'Validating Conflicts...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Cancellation"
        maxWidth="440px"
      >
        {cancellingBooking && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{
                display: 'inline-flex',
                padding: '14px',
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                borderRadius: '50%',
                marginBottom: '12px'
              }}>
                <XCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>Cancel this reservation?</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                Are you sure you want to cancel booking <strong>#{cancellingBooking.id}</strong> for <strong>{cancellingBooking.resourceName}</strong>?
                This time slot will immediately be released for other students and faculty.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCancelConfirm}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
