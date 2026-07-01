import React, { useState } from 'react';
import './index.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Mock Authentication Logic:
    // In production, this verifies the JWT token from your backend.
    let role = 'CUSTOMER';
    if (email.toLowerCase().includes('admin')) {
      role = 'ADMIN';
    } else if (email.toLowerCase().includes('agent')) {
      role = 'AGENT';
    }

    // Pass the user info up to the App component
    onLogin({ email, role });
  };

  return (
    <div className="layout-background" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 className="brand-title" style={{ textAlign: 'center', marginBottom: '8px' }}>Welcome Back</h1>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: '24px' }}>Sign in to access your portal.</p>
        
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
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
            Secure Sign In
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '0.85rem', color: '#64748b', textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
          <strong>Testing Tip:</strong><br/>
          Type "admin" in email for Admin Portal<br/>
          Type anything else for Customer Portal
        </div>
      </div>
    </div>
  );
};

export default Login;