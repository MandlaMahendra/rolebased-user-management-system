import React, { useEffect, useContext } from 'react';
import { User, IdCard, LogOut, BookOpen, Pen, Edit, Trash } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role === 'Admin') {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderBadge = (hasPerm) => {
        if (hasPerm) {
            return (
                <span className="badge badge-success" style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>Active</span>
            );
        }
        return (
            <span className="badge badge-danger" style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>None</span>
        );
    };

    const perms = user.permissions || { read: false, write: false, update: false, delete: false };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 style={{ display: 'flex', alignItems: 'center' }}>
                        <User size={24} style={{ color: 'var(--accent-color)', marginRight: '10px' }} />
                        RBAC System
                    </h2>
                    <p style={{ fontSize: '0.8rem' }}>User: {user.name}</p>
                </div>
                <nav className="sidebar-nav">
                    <a href="#" className="nav-item active" onClick={e => e.preventDefault()}>
                        <IdCard size={18} style={{ marginRight: '8px' }} /> My Profile
                    </a>
                </nav>
                <div className="sidebar-footer">
                    <a href="#" className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger-color)' }}>
                        <LogOut size={18} style={{ marginRight: '8px' }} /> Logout
                    </a>
                </div>
            </aside>

            <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        color: 'var(--accent-color)',
                    }}>
                        <User size={40} />
                    </div>
                    
                    <h2>{user.name}</h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>{user.email}</p>

                    <div style={{ textAlign: 'left' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Your Permissions</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <BookOpen size={16} style={{ marginRight: '8px', color: 'var(--text-secondary)' }} /> Read
                                    </span>
                                    {renderBadge(perms.read)}
                                </div>
                            </div>
                            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <Pen size={16} style={{ marginRight: '8px', color: 'var(--text-secondary)' }} /> Write
                                    </span>
                                    {renderBadge(perms.write)}
                                </div>
                            </div>
                            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <Edit size={16} style={{ marginRight: '8px', color: 'var(--text-secondary)' }} /> Update
                                    </span>
                                    {renderBadge(perms.update)}
                                </div>
                            </div>
                            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <Trash size={16} style={{ marginRight: '8px', color: 'var(--text-secondary)' }} /> Delete
                                    </span>
                                    {renderBadge(perms.delete)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
