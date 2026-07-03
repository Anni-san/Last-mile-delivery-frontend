import React, { useState } from 'react';
import './index.css';

const Login = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      localStorage.setItem('token', data.token);
      onLogin(data.user);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="layout-background" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 className="brand-title" style={{ textAlign: 'center', marginBottom: '8px' }}>Welcome Back</h1>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: '24px' }}>Sign in to access your portal.</p>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="e.g., admin@test.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', marginTop: '8px', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Authenticating...' : 'Secure Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '12px' }}>
            🧪 Evaluator Demo Credentials:
          </strong>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Admin:</strong> admin@test.com<br/><span style={{ color: '#94a3b8' }}>Pass: password123</span></li>
            <li><strong>Agent:</strong> agent3@test.com<br/><span style={{ color: '#94a3b8' }}>Pass: password123</span></li>
            <li><strong>Customer:</strong> customer@test.com<br/><span style={{ color: '#94a3b8' }}>Pass: password123</span></li>
          </ul>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
          <span className="text-muted">Don't have an account? </span>
          {/* Changed from <a> tag to a button using the onGoToRegister prop */}
          <button 
            onClick={onGoToRegister} 
            style={{ color: '#2563eb', fontWeight: '500', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Sign up here
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;