import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Mail, Lock, LogIn, Activity } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification('Please fill in all credentials fields', 'warning');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      showNotification('Successfully logged in!', 'success');
      navigate('/');
    } else {
      showNotification(res.message || 'Authentication failed. Please verify credentials.', 'error');
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: 'var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-color)',
            marginBottom: '0.5rem'
          }}>
            <Activity size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>MediSync Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
            Enter credentials below to enter your workstation.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@gmail.com"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Password input */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '46px', fontSize: '0.95rem' }}
            disabled={submitting}
          >
            <LogIn size={16} />
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', display: 'block', marginBottom: '0.25rem' }}>
            Quick Demo Access (One-Click Login)
          </span>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            <button 
              type="button"
              className="btn-pill"
              style={{ 
                backgroundColor: 'var(--primary-glow)', 
                color: 'var(--primary-color)', 
                border: '1px solid rgba(37, 99, 235, 0.2)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'var(--transition)'
              }}
              onClick={async () => {
                setSubmitting(true);
                const res = await login('aarav@gmail.com', 'aarav123');
                setSubmitting(false);
                if (res.success) {
                  showNotification('Logged in as Aarav Sharma', 'success');
                  navigate('/');
                }
              }}
            >
              🧑‍⚕️ Aarav (Patient)
            </button>
            
            <button 
              type="button"
              className="btn-pill"
              style={{ 
                backgroundColor: 'var(--primary-glow)', 
                color: 'var(--primary-color)', 
                border: '1px solid rgba(37, 99, 235, 0.2)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'var(--transition)'
              }}
              onClick={async () => {
                setSubmitting(true);
                const res = await login('priya@gmail.com', 'priya123');
                setSubmitting(false);
                if (res.success) {
                  showNotification('Logged in as Priya Patel', 'success');
                  navigate('/');
                }
              }}
            >
              👩‍⚕️ Priya (Patient)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            <button 
              type="button"
              className="btn-pill"
              style={{ 
                backgroundColor: 'rgba(79, 70, 229, 0.08)', 
                color: '#4f46e5', 
                border: '1px solid rgba(79, 70, 229, 0.2)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'var(--transition)'
              }}
              onClick={async () => {
                setSubmitting(true);
                const res = await login('vikram@gmail.com', 'vikram123');
                setSubmitting(false);
                if (res.success) {
                  showNotification('Logged in as Dr. Vikram Mehta', 'success');
                  navigate('/');
                }
              }}
            >
              🩺 Dr. Vikram
            </button>
            
            <button 
              type="button"
              className="btn-pill"
              style={{ 
                backgroundColor: 'rgba(79, 70, 229, 0.08)', 
                color: '#4f46e5', 
                border: '1px solid rgba(79, 70, 229, 0.2)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'var(--transition)'
              }}
              onClick={async () => {
                setSubmitting(true);
                const res = await login('aditi@gmail.com', 'aditi123');
                setSubmitting(false);
                if (res.success) {
                  showNotification('Logged in as Dr. Aditi Rao', 'success');
                  navigate('/');
                }
              }}
            >
              🩺 Dr. Aditi
            </button>
          </div>

          <button 
            type="button"
            className="btn-pill"
            style={{ 
              width: '100%', 
              backgroundColor: 'rgba(15, 23, 42, 0.05)', 
              color: '#0f172a', 
              border: '1px solid rgba(15, 23, 42, 0.1)',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'var(--transition)'
            }}
            onClick={async () => {
              setSubmitting(true);
              const res = await login('admin@apexhealth.com', 'adminpassword123');
              setSubmitting(false);
              if (res.success) {
                showNotification('Logged in as Admin (Administrator)', 'success');
                navigate('/');
              }
            }}
          >
            ⚙️ Log in as Admin (Administrator)
          </button>
        </div>

        {/* Footer shortcuts */}
        <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <p>
            New patient?{' '}
            <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
