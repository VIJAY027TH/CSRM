import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Search,
  Filter,
  MapPin,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
  Landmark,
  FlaskConical,
  KeyRound,
  Camera
} from 'lucide-react';

export const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [availFilter, setAvailFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getResources({
        type: typeFilter || undefined,
        availability: availFilter || undefined,
        search: searchTerm || undefined
      });
      setResources(data || []);
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [typeFilter, availFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const openBookModal = (res) => {
    setSelectedResource(res);
    setBookingError('');
    setBookingSuccess('');
    setPurpose('');
    setBookingModalOpen(true);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    const startDateTime = `${bookingDate}T${startTime}:00`;
    const endDateTime = `${bookingDate}T${endTime}:00`;

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setBookingError('End time must be strictly after start time.');
      return;
    }

    setSubmitting(true);
    try {
      await bookingService.createBooking({
        resourceId: selectedResource.id,
        startTime: startDateTime,
        endTime: endDateTime,
        purpose
      });

      setBookingSuccess('Booking successfully confirmed! A notification has been generated.');
      setTimeout(() => {
        setBookingModalOpen(false);
        navigate('/my-bookings');
      }, 1500);
    } catch (err) {
      setBookingError(err.friendlyMessage || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const isRoleRestricted = (res) => {
    return user?.role === 'STUDENT' && res.type === 'CLASSROOM';
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'CLASSROOM': return <Landmark size={20} color="var(--deep-sage)" />;
      case 'LAB': return <FlaskConical size={20} color="var(--dark-sage)" />;
      case 'LOCKER': return <KeyRound size={20} color="var(--warm-amber)" />;
      case 'EQUIPMENT': return <Camera size={20} color="var(--primary-sage)" />;
      default: return <Landmark size={20} color="var(--deep-sage)" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Campus Resources
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
          Find and reserve classrooms, labs, lockers, and equipment
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '18px 22px', marginBottom: '28px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '40px' }}
              placeholder="Search by facility name, building, equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setSearchParams(e.target.value ? { type: e.target.value } : {});
              }}
            >
              <option value="">All Categories</option>
              <option value="CLASSROOM">Classroom</option>
              <option value="LAB">Laboratory</option>
              <option value="LOCKER">Smart Locker</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-control"
              value={availFilter}
              onChange={(e) => setAvailFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            Filter
          </button>
        </form>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Searching campus inventory..." />
      ) : resources.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
          <Filter size={40} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <h3>No resources match your search</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>Try resetting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid-3">
          {resources.map((res) => {
            const restricted = isRoleRestricted(res);
            const isAvailable = res.availability === 'AVAILABLE';

            return (
              <div key={res.id} className="resource-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getResourceIcon(res.type)}
                    </div>
                    <StatusBadge status={res.availability} />
                  </div>

                  <span className="resource-card-type">{res.type}</span>
                  <h3 className="resource-card-name">{res.name}</h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '42px', lineHeight: '1.45' }}>
                    {res.description || 'Modern facility equipped for student and faculty academic operations.'}
                  </p>

                  <div className="resource-card-meta">
                    <div className="resource-card-meta-item">
                      <MapPin size={14} color="var(--deep-sage)" />
                      <span>{res.location}</span>
                    </div>
                    {res.capacity > 1 && (
                      <div className="resource-card-meta-item">
                        <Users size={14} color="var(--text-secondary)" />
                        <span>Capacity: {res.capacity} people</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '8px' }}>
                  {restricted ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      disabled
                      title="Classrooms can only be reserved by faculty"
                    >
                      <Lock size={14} />
                      <span>Faculty Only</span>
                    </button>
                  ) : !isAvailable ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                      disabled
                    >
                      Currently {res.availability}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => openBookModal(res)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Calendar size={14} />
                        <span>Book Resource</span>
                      </button>
                      <button
                        onClick={() => navigate(`/calendar?resourceId=${res.id}`)}
                        className="btn btn-secondary btn-sm"
                        title="View Full Schedule Calendar"
                      >
                        Calendar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={selectedResource ? `Reserve: ${selectedResource.name}` : 'Reserve Resource'}
      >
        {selectedResource && (
          <form onSubmit={handleBookSubmit}>
            {bookingError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                <div>{bookingError}</div>
              </div>
            )}

            {bookingSuccess && (
              <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} />
                <div>{bookingSuccess}</div>
              </div>
            )}

            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.85rem' }}>
              <div><strong>Facility:</strong> {selectedResource.name} ({selectedResource.type})</div>
              <div><strong>Location:</strong> {selectedResource.location}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Reservation Date</label>
              <input
                type="date"
                className="form-control"
                min={new Date().toISOString().split('T')[0]}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Purpose / Academic Reason</label>
              <textarea
                className="form-control"
                placeholder="State the academic purpose (e.g. Lab experiment, seminar presentation, robotics prototyping)..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBookingModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
