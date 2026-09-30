import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Shield,
  Filter,
  UserCheck
} from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Status/Role change modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);

  // Active tab: 'pending' or 'all'
  const [activeTab, setActiveTab] = useState('pending');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [allList, pendList] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getPendingUsers()
      ]);
      setUsers(allList || []);
      setPendingUsers(pendList || []);
    } catch (err) {
      setErrorMsg('Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId, username) => {
    try {
      await adminService.approveUser(userId);
      setSuccessMsg(`User ${username} approved successfully! Notification sent.`);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.friendlyMessage || 'Failed to approve user.');
    }
  };

  const handleReject = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to reject user registration for ${username}?`)) return;
    try {
      await adminService.rejectUser(userId);
      setSuccessMsg(`User ${username} rejected.`);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.friendlyMessage || 'Failed to reject user.');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setNewRole(user.role);
    setEditModalOpen(true);
  };

  const handleSaveUserChanges = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setErrorMsg('');

    try {
      if (newStatus !== selectedUser.status) {
        await adminService.updateUserStatus(selectedUser.id, newStatus);
      }
      if (newRole !== selectedUser.role) {
        await adminService.updateUserRole(selectedUser.id, newRole);
      }

      setSuccessMsg(`Updated account settings for ${selectedUser.username}.`);
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.friendlyMessage || 'Failed to update user.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading user directory..." />;

  const filteredUsers = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter && u.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            User Accounts
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Manage student and faculty registrations & campus credentials
          </p>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <UserCheck size={16} />
          <span>Pending Approvals ({pendingUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={16} />
          <span>All Users ({users.length})</span>
        </button>
      </div>

      {activeTab === 'pending' ? (
        /* PENDING USERS SECTION */
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Pending Account Registrations</h2>
              <p className="card-subtitle">
                New students and faculty must be approved before they can log in and reserve facilities
              </p>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={44} style={{ margin: '0 auto 12px', color: 'var(--deep-sage)' }} />
              <h3 style={{ color: 'var(--text-main)' }}>All caught up!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>There are currently no pending registration requests.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Requested Role</th>
                    <th>Registered</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{u.id}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.username}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className={`user-pill-role role-badge-${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={u.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleApprove(u.id, u.username)}
                            className="btn btn-success btn-sm"
                            title="Approve user registration"
                          >
                            <CheckCircle size={14} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(u.id, u.username)}
                            className="btn btn-danger btn-sm"
                            title="Reject user registration"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ALL USERS SECTION */
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 className="card-title">All Registered Users</h2>
              <p className="card-subtitle">Manage accounts, status transitions, and role privileges</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className="form-control"
                style={{ width: '140px', padding: '6px 10px', fontSize: '0.8rem' }}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="FACULTY">Faculty</option>
                <option value="STUDENT">Student</option>
              </select>

              <select
                className="form-control"
                style={{ width: '140px', padding: '6px 10px', fontSize: '0.8rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{u.id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.username}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`user-pill-role role-badge-${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => openEditModal(u)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedUser ? `Manage Account: ${selectedUser.username}` : 'Manage Account'}
      >
        {selectedUser && (
          <form onSubmit={handleSaveUserChanges}>
            <div style={{ padding: '14px 18px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.85rem' }}>
              <div><strong>User:</strong> {selectedUser.username} (#{selectedUser.id})</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                required
              >
                <option value="ADMIN">ADMIN (Full System Access)</option>
                <option value="FACULTY">FACULTY (Classrooms, Labs, Equipment)</option>
                <option value="STUDENT">STUDENT (Lockers, Labs, Equipment)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-control"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                <option value="ACTIVE">ACTIVE (Authorized to log in & book)</option>
                <option value="APPROVED">APPROVED (Authorized to log in)</option>
                <option value="PENDING">PENDING (Awaiting admin approval)</option>
                <option value="REJECTED">REJECTED (Access blocked)</option>
                <option value="INACTIVE">INACTIVE (Deactivated account)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditModalOpen(false)}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Update User Access'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
