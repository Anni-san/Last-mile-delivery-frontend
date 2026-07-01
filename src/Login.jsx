import React, { useState } from 'react';
import './index.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Send credentials to your real Node.js backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      // 2. Success! Store the JWT securely in the browser
      localStorage.setItem('token', data.token);

      // 3. Pass the real user data (id, name, role) up to the App component
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
        
        {/* Display backend errors (e.g., "Invalid password") */}
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
      </div>
    </div>
  );
};

export default Login;