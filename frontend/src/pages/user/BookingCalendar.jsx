import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/resourceService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  Building2,
  MapPin,
  Info,
  CalendarCheck
} from 'lucide-react';

const STANDARD_SLOTS = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '12:00', end: '13:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
  { start: '18:00', end: '19:00' },
  { start: '19:00', end: '20:00' },
];

export const BookingCalendar = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState(searchParams.get('resourceId') || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Selected time slot for booking
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch all resources on mount
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const list = await resourceService.getResources();
        setResources(list || []);

        if (!selectedResourceId && list.length > 0) {
          if (user?.role === 'STUDENT') {
            const allowed = list.find(r => r.type !== 'CLASSROOM') || list[0];
            setSelectedResourceId(allowed.id.toString());
          } else {
            setSelectedResourceId(list[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Failed to load resources', err);
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, []);

  // Fetch occupied slots whenever selectedResourceId or selectedDate changes
  useEffect(() => {
    if (!selectedResourceId || !selectedDate) return;

    const loadSlots = async () => {
      try {
        setSlotsLoading(true);
        setSelectedSlot(null);
        setErrorMsg('');
        const bookings = await resourceService.getResourceSlots(selectedResourceId, selectedDate);
        setExistingBookings(bookings || []);
      } catch (err) {
        console.error('Failed to fetch schedule slots', err);
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();
  }, [selectedResourceId, selectedDate]);

  const currentResource = resources.find(r => r.id.toString() === selectedResourceId);

  // Check if a time slot overlaps with any active booking
  const isSlotOccupied = (slot) => {
    if (!existingBookings || existingBookings.length === 0) return false;

    const slotStart = new Date(`${selectedDate}T${slot.start}:00`).getTime();
    const slotEnd = new Date(`${selectedDate}T${slot.end}:00`).getTime();

    return existingBookings.some(b => {
      if (b.status === 'CANCELLED') return false;
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return bStart < slotEnd && bEnd > slotStart;
    });
  };

  const handleBookSlot = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMsg('Please select an available time slot from the schedule.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const startDateTime = `${selectedDate}T${selectedSlot.start}:00`;
      const endDateTime = `${selectedDate}T${selectedSlot.end}:00`;

      await bookingService.createBooking({
        resourceId: currentResource.id,
        startTime: startDateTime,
        endTime: endDateTime,
        purpose
      });

      setSuccessMsg(`Booking confirmed for ${selectedSlot.start} - ${selectedSlot.end}! Conflict detection passed.`);
      const updated = await resourceService.getResourceSlots(selectedResourceId, selectedDate);
      setExistingBookings(updated || []);
      setSelectedSlot(null);
      setPurpose('');

      setTimeout(() => {
        navigate('/my-bookings');
      }, 1800);
    } catch (err) {
      setErrorMsg(err.friendlyMessage || 'Unable to book the slot. Conflict or restriction occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading booking calendar..." />;

  const isRestrictedForUser = user?.role === 'STUDENT' && currentResource?.type === 'CLASSROOM';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Book a Resource
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
          Interactive calendar with real-time slot availability and conflict prevention
        </p>
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

      {/* Selectors Bar */}
      <div className="card" style={{ padding: '22px 26px', marginBottom: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Select Resource</label>
            <select
              className="form-control"
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
            >
              {resources.map(r => (
                <option key={r.id} value={r.id}>
                  [{r.type}] {r.name} - {r.location}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Select Date</label>
            <input
              type="date"
              className="form-control"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {currentResource && (
          <div style={{
            marginTop: '18px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                {currentResource.name}
              </span>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--deep-sage)' }} /> {currentResource.location}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
              <StatusBadge status={currentResource.availability} />
            </div>
          </div>
        )}
      </div>

      {isRestrictedForUser ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--danger-light)', border: '1px solid var(--danger-border)' }}>
          <Lock size={44} style={{ margin: '0 auto 12px', color: 'var(--danger)' }} />
          <h3 style={{ color: 'var(--danger)' }}>Classroom Reserved for Faculty</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Classrooms and Auditorium halls can only be booked by Faculty members. As a student, please select Lockers, Labs, or Equipment.
          </p>
        </div>
      ) : currentResource?.availability !== 'AVAILABLE' ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
          <AlertCircle size={44} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <h3>Facility Currently {currentResource?.availability}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            This resource is temporarily unavailable for reservations. Please choose another facility.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {/* Time Slot Visualizer */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Available Time Slots</h2>
                <p className="card-subtitle">
                  {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {slotsLoading ? (
              <LoadingSpinner message="Checking real-time slot availability..." />
            ) : (
              <div>
                <div className="calendar-time-slots">
                  {STANDARD_SLOTS.map((slot, idx) => {
                    const occupied = isSlotOccupied(slot);
                    const isSelected = selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={occupied}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setErrorMsg('');
                        }}
                        className={`time-slot-btn ${occupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                        title={occupied ? 'Slot already occupied' : `Select ${slot.start} - ${slot.end}`}
                      >
                        <div style={{ fontWeight: 600 }}>{slot.start} - {slot.end}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                          {occupied ? 'Occupied ✕' : isSelected ? 'Selected ✓' : 'Available'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '18px',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--bg-surface-soft)', border: '1px solid var(--sage-border)' }} />
                    <span>Available</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--deep-sage)' }} />
                    <span>Selected</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#F4F4F2', border: '1px solid var(--border)' }} />
                    <span>Occupied</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Confirmation Box */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Reservation Summary</h2>
            </div>

            <form onSubmit={handleBookSlot}>
              <div style={{ padding: '16px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Resource:</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{currentResource?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Date:</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{selectedDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selected Slot:</span>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: selectedSlot ? 'var(--deep-sage)' : 'var(--text-muted)'
                  }}>
                    {selectedSlot ? `${selectedSlot.start} - ${selectedSlot.end}` : 'None selected'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Purpose of Reservation</label>
                <textarea
                  className="form-control"
                  placeholder="State the academic purpose (e.g. project preparation, exam review, research)..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px' }}
                disabled={!selectedSlot || submitting}
              >
                {submitting ? 'Verifying & Booking...' : selectedSlot ? `Confirm Booking for ${selectedSlot.start} - ${selectedSlot.end}` : 'Select a Slot to Continue'}
              </button>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '14px', textAlign: 'center', lineHeight: 1.4 }}>
                🌿 CSRM guarantees conflict-free bookings with strict backend interval verification.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
