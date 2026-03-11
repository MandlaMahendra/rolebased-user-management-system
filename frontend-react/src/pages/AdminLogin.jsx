import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { post, ApiError } from '../api/apiClient';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { ok, data } = await post('/auth/login', { email, password });

            if (ok) {
                if (data.role !== 'Admin') {
                    setError('Access Denied: Only Admins can log in here.');
                    return;
                }

                login(data, data.token);
                navigate('/admin-dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="glass-panel login-box" style={{ borderTop: '4px solid var(--danger-color)' }}>
                <div className="login-header">
                    <div style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>
                        <ShieldAlert size={48} style={{ margin: '0 auto' }} />
                    </div>
                    <h1>Admin Portal</h1>
                    <p>Secure Administrator Access Only</p>
                </div>

                <form id="adminLoginForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Admin Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-text" style={{ marginBottom: '1rem', display: 'block' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--danger-color)' }} disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Enter'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                            ← Back to Main Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
