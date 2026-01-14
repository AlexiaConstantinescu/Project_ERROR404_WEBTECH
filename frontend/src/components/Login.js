import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await login(email, password);
            const { token, user } = res.data;
            loginWithToken(token, user);
            navigate('/');
        } catch (err) {
            setError(err.data?.message || err.message);
        }
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: 700, color: '#1f2937', textAlign: 'center' }}>🔐 Login</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'white', padding: '32px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#374151' }}>Email *</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="yourname@stud.ase.ro"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#374151' }}>Password *</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit'
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>
                {error && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        borderRadius: '6px',
                        fontWeight: 500,
                        fontSize: '14px'
                    }}>
                        ❌ {error}
                    </div>
                )}
                <button
                    type="submit"
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginTop: '8px'
                    }}
                    onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
                >
                    Login
                </button>
                <p style={{ textAlign: 'center', margin: '16px 0 0', fontSize: '14px', color: '#666' }}>
                    Don't have an account? <a href="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Register here</a>
                </p>
            </form>
        </div>
    );
}
