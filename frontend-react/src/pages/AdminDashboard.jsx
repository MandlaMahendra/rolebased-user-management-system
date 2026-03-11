import React, { useState, useEffect, useContext } from 'react';
import {
    ShieldHalf, Users, ClipboardList, LogOut, Search, Plus,
    UserCheck, Shield, Code, Trash2, X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { get, post, put, del } from '../api/apiClient';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'logs'
    const [stats, setStats] = useState({ totalUsers: '--', activeUsers: '--', adminUsers: '--' });
    const [allUsers, setAllUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState([]);

    // Modals
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

    // Add User State
    const [addFormData, setAddFormData] = useState({ name: '', email: '', password: '', role: 'User' });
    const [addError, setAddError] = useState('');

    // JSON Editor State
    const [editingUserId, setEditingUserId] = useState(null);
    const [jsonInput, setJsonInput] = useState('');
    const [jsonError, setJsonError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            navigate('/login');
            return;
        }
        fetchStats();
        fetchUsers();
    }, [user, navigate]);

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    // Auth headers are automatically injected by apiClient

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchStats = async () => {
        try {
            const { ok, data } = await get('/users/stats');
            if (ok) setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { ok, data } = await get('/users');
            if (ok) setAllUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchLogs = async () => {
        try {
            const { ok, data } = await get('/users/logs');
            if (ok) setLogs(data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        }
    };

    const togglePermission = async (userId, perm) => {
        const userObj = allUsers.find(u => u._id === userId);
        if (!userObj) return;

        const updatedPermissions = { ...userObj.permissions, [perm]: !userObj.permissions[perm] };

        // Optimistic UI Update
        setAllUsers(allUsers.map(u => u._id === userId ? { ...u, permissions: updatedPermissions } : u));

        try {
            const { ok: res_ok } = await put(`/users/${userId}`, { permissions: updatedPermissions });

            if (res_ok) {
                fetchStats();
            } else {
                // Revert if failed
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to update permission:', error);
            fetchUsers();
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const { ok } = await del(`/users/${id}`);

            if (ok) {
                fetchUsers();
                fetchStats();
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const openJsonModal = (userId) => {
        const userObj = allUsers.find(u => u._id === userId);
        if (!userObj) return;

        setEditingUserId(userId);
        const exportObj = {
            name: userObj.name,
            email: userObj.email,
            role: userObj.role,
            permissions: userObj.permissions
        };

        setJsonInput(JSON.stringify(exportObj, null, 2));
        setJsonError('');
        setIsJsonModalOpen(true);
    };

    const saveJsonUser = async () => {
        setJsonError('');
        let parsedData;
        try {
            parsedData = JSON.parse(jsonInput);
        } catch (e) {
            setJsonError('Invalid JSON structure. Please verify.');
            return;
        }

        try {
            const { ok, data } = await put(`/users/${editingUserId}`, parsedData);

            if (ok) {
                setIsJsonModalOpen(false);
                fetchUsers();
                fetchStats();
            } else {
                setJsonError(data.message || 'Error updating user');
            }
        } catch (error) {
            setJsonError(error.message || 'Connection failed. Is the backend running?');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddError('');
        try {
            const { ok, data } = await post('/users', addFormData);

            if (ok) {
                setIsAddUserModalOpen(false);
                setAddFormData({ name: '', email: '', password: '', role: 'User' });
                fetchUsers();
                fetchStats();
            } else {
                setAddError(data.message || 'Failed to create user');
            }
        } catch (error) {
            setAddError(error.message || 'Connection failed. Is the backend running?');
        }
    };

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 style={{ display: 'flex', alignItems: 'center' }}>
                        <ShieldHalf size={24} style={{ color: 'var(--accent-color)', marginRight: '10px' }} />
                        RBAC System
                    </h2>
                    <p style={{ fontSize: '0.8rem' }}>Admin: {user?.name}</p>
                </div>
                <nav className="sidebar-nav">
                    <a href="#" className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}>
                        <Users size={18} style={{ marginRight: '8px' }} /> Users Management
                    </a>
                    <a href="#" className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('logs'); }}>
                        <ClipboardList size={18} style={{ marginRight: '8px' }} /> Activity Logs
                    </a>
                </nav>
                <div className="sidebar-footer">
                    <a href="#" className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger-color)' }}>
                        <LogOut size={18} style={{ marginRight: '8px' }} /> Logout
                    </a>
                </div>
            </aside>

            <main className="main-content">
                {activeTab === 'users' && (
                    <>
                        <header className="top-header">
                            <div className="search-bar">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-primary" onClick={() => setIsAddUserModalOpen(true)}>
                                <Plus size={16} style={{ marginRight: '8px' }} /> Add New User
                            </button>
                        </header>

                        <div className="stats-grid">
                            <div className="glass-panel stat-card">
                                <div className="stat-icon"><Users size={24} /></div>
                                <div className="stat-info">
                                    <h3>Total Users</h3>
                                    <p>{stats.totalUsers}</p>
                                </div>
                            </div>
                            <div className="glass-panel stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}><UserCheck size={24} /></div>
                                <div className="stat-info">
                                    <h3>Active Users</h3>
                                    <p>{stats.activeUsers}</p>
                                </div>
                            </div>
                            <div className="glass-panel stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}><Shield size={24} /></div>
                                <div className="stat-info">
                                    <h3>Admin Users</h3>
                                    <p>{stats.adminUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Permissions (R / W / U / D)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u._id}>
                                            <td><div style={{ fontWeight: 500 }}>{u.name}</div></td>
                                            <td>{u.email}</td>
                                            <td><span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-user'}`}>{u.role}</span></td>
                                            <td>
                                                <div className="checkbox-group">
                                                    {['read', 'write', 'update', 'delete'].map(perm => (
                                                        <label className="checkbox-label" key={perm}>
                                                            <input
                                                                type="checkbox"
                                                                checked={!!u.permissions?.[perm]}
                                                                onChange={() => togglePermission(u._id, perm)}
                                                            />
                                                            <span className="checkmark"></span> {perm.charAt(0).toUpperCase()}
                                                        </label>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn btn-icon" title="Edit JSON" onClick={() => openJsonModal(u._id)}>
                                                        <Code size={16} />
                                                    </button>
                                                    <button className="btn btn-icon" title="Delete User" style={{ color: 'var(--danger-color)' }} onClick={() => deleteUser(u._id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'logs' && (
                    <div>
                        <h2>System Activity Logs</h2>
                        <div className="glass-panel table-container" style={{ marginTop: '1.5rem' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Action</th>
                                        <th>User ID / Initiator</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, i) => (
                                        <tr key={i}>
                                            <td>{new Date(log.createdAt).toLocaleString()}</td>
                                            <td><span className="badge badge-admin">{log.action}</span></td>
                                            <td>{log.userId ? (typeof log.userId === 'object' ? log.userId.email : log.userId) : 'System'}</td>
                                            <td>{log.details || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Add User Modal */}
            {isAddUserModalOpen && (
                <div className="modal-overlay active">
                    <div className="glass-panel modal-content">
                        <div className="modal-header">
                            <h2>Add New User</h2>
                            <button className="modal-close" onClick={() => setIsAddUserModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input type="text" className="form-input" required value={addFormData.name} onChange={e => setAddFormData({ ...addFormData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-input" required value={addFormData.email} onChange={e => setAddFormData({ ...addFormData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input type="password" className="form-input" required value={addFormData.password} onChange={e => setAddFormData({ ...addFormData, password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select className="form-input" style={{ background: '#1e293b', color: 'white' }} value={addFormData.role} onChange={e => setAddFormData({ ...addFormData, role: e.target.value })}>
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            {addError && <div className="error-text" style={{ display: 'block', marginBottom: '1rem' }}>{addError}</div>}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn" onClick={() => setIsAddUserModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'white' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* JSON Editor Modal */}
            {isJsonModalOpen && (
                <div className="modal-overlay active">
                    <div className="glass-panel modal-content">
                        <div className="modal-header">
                            <h2>Edit User Details (JSON)</h2>
                            <button className="modal-close" onClick={() => setIsJsonModalOpen(false)}><X size={20} /></button>
                        </div>
                        <textarea className="json-editor" value={jsonInput} onChange={e => setJsonInput(e.target.value)}></textarea>
                        {jsonError && <div className="error-text" style={{ display: 'block', marginBottom: '1rem' }}>{jsonError}</div>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn" onClick={() => setIsJsonModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'white' }}>Cancel</button>
                            <button className="btn btn-primary" onClick={saveJsonUser}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
