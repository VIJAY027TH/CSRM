import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { resourceService } from '../../services/resourceService';
import { notificationService } from '../../services/notificationService';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Calendar,
  Layers,
  Clock,
  Bell,
  ArrowRight,
  PlusCircle,
  MapPin,
  CalendarCheck,
  Compass
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [myBookings, resList, unread] = await Promise.all([
          bookingService.getMyBookings(),
          resourceService.getResources(),
          notificationService.getUnreadCount()
        ]);
        // Sort general bookings newest created first (createdAt DESC)
        const sorted = (myBookings || []).sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (dateB !== dateA) return dateB - dateA;
          return (b.id || 0) - (a.id || 0);
        });
        setBookings(sorted);
        setResources(resList || []);
        setUnreadNotifs(unread || 0);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your campus workspace..." />;

  const activeBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
  // Upcoming reservations strictly ordered by nearest start time first (startTime ASC)
  const upcomingBookings = [...activeBookings].sort((a, b) => {
    const timeA = new Date(a.startTime).getTime();
    const timeB = new Date(b.startTime).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return (a.id || 0) - (b.id || 0);
  });
  const availableResources = resources.filter(r => r.availability === 'AVAILABLE');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          {getGreeting()}, {user?.username}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Manage your campus resources and reservations &bull; {user?.role} Portal
        </p>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-sage">
            <Layers size={22} />
          </div>
          <div>
            <div className="stat-value">{availableResources.length}</div>
            <div className="stat-label">Available Resources</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-sage">
            <CalendarCheck size={22} />
          </div>
          <div>
            <div className="stat-value">{activeBookings.length}</div>
            <div className="stat-label">My Active Bookings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-neutral">
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Reservations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-amber">
            <Bell size={22} />
          </div>
          <div>
            <div className="stat-value">{unreadNotifs}</div>
            <div className="stat-label">Notifications</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '28px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Quick Actions</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Common facility reservation workflows</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/calendar" className="btn btn-primary btn-sm">
              <Calendar size={15} />
              <span>Book a Resource</span>
            </Link>
            <Link to="/my-bookings" className="btn btn-secondary btn-sm">
              <CalendarCheck size={15} />
              <span>View My Bookings</span>
            </Link>
            <Link to="/resources" className="btn btn-secondary btn-sm">
              <Compass size={15} />
              <span>Browse Resources</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Reservations & Resource Shortcuts */}
      <div className="grid-2">
        {/* Upcoming Reservations */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Upcoming Reservations</h2>
              <p className="card-subtitle">Your active scheduled campus slots</p>
            </div>
            <Link to="/my-bookings" className="btn btn-secondary btn-sm">
              View All ({bookings.length})
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
              <Calendar size={44} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
              <p style={{ fontWeight: 600 }}>No upcoming reservations</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Book a classroom, lab, or smart locker to get started.</p>
              <Link to="/calendar" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                Reserve a Facility
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingBookings.slice(0, 4).map(b => (
                <div key={b.id} style={{
                  padding: '16px',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{b.resourceName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                      <MapPin size={12} color="var(--deep-sage)" /> {b.location} &bull; {b.resourceType}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 500, marginTop: '4px' }}>
                      {new Date(b.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} &bull; {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campus Facilities Exploration */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Explore Facilities</h2>
              <p className="card-subtitle">Browse by facility type</p>
            </div>
            <Link to="/resources" className="btn btn-secondary btn-sm">
              All Resources <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <Link to="/resources?type=CLASSROOM" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                padding: '18px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🏛️</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Classrooms</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Auditoriums & Halls</div>
              </div>
            </Link>

            <Link to="/resources?type=LAB" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                padding: '18px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-soft)',
                border: '1px solid var(--sage-border)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🔬</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--deep-sage)' }}>Laboratories</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI, Robotics & IT</div>
              </div>
            </Link>

            <Link to="/resources?type=LOCKER" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                padding: '18px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🔐</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Smart Lockers</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>RFID Library Bays</div>
              </div>
            </Link>

            <Link to="/resources?type=EQUIPMENT" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                padding: '18px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--amber-light)',
                border: '1px solid var(--amber-border)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🎥</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark-amber)' }}>Equipment</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cameras & 3D Printers</div>
              </div>
            </Link>
          </div>

          <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg-surface-soft)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sage-border)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--deep-sage)', margin: 0, lineHeight: 1.5 }}>
              🌿 <strong>Conflict-Free Assurance:</strong> All reservations are verified instantaneously at the server level. Slots are never double-booked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
