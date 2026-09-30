import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  UserCheck,
  Info
} from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, readStatus: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, readStatus: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading notifications..." />;

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMATION':
      case 'BOOKING_MODIFICATION':
        return <Calendar size={18} color="var(--primary)" />;
      case 'ACCOUNT_APPROVED':
        return <UserCheck size={18} color="var(--success)" />;
      default:
        return <Bell size={18} color="var(--accent)" />;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Notifications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            System alerts, booking confirmations, account updates, and reminders
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary">
            <CheckCheck size={16} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
            <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3>No notifications yet</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>You will receive notifications here when you book resources or when status changes occur.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: !n.readStatus ? 'var(--bg-surface)' : 'var(--bg-card)',
                  borderLeft: !n.readStatus ? '4px solid var(--deep-sage)' : '4px solid transparent',
                  transition: 'background-color 0.15s'
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-soft)',
                    marginTop: '2px'
                  }}>
                    {getNotifIcon(n.type)}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: !n.readStatus ? 600 : 400, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                      {n.message}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--text-sub)' }}>
                        {n.type.toLowerCase().replace(/_/g, ' ')}
                      </span>
                      <span>&bull;</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {!n.readStatus && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ marginLeft: '12px', flexShrink: 0 }}
                    title="Mark as read"
                  >
                    <Check size={14} />
                    <span>Done</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
