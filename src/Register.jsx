import React, { useState } from 'react';
import './index.css';

const Register = ({ onGoToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER' // Default to customer
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful! You can now log in.');
        setFormData({ name: '', email: '', password: '', role: 'CUSTOMER' });
      } else {
        throw new Error(data.error || 'Registration failed.');
      }
    } catch (err) {
      setIsError(true);
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="layout-background" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 className="brand-title" style={{ textAlign: 'center', marginBottom: '8px' }}>Create an Account</h1>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: '24px' }}>Join the logistics platform</p>

        {message && (
          <div style={{ 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px', 
            fontSize: '0.9rem',
            backgroundColor: isError ? '#fee2e2' : '#dcfce7', 
            color: isError ? '#991b1b' : '#166534' 
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-control" required value={formData.name} onChange={handleChange} placeholder="Jane Doe" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className="form-control" required value={formData.email} onChange={handleChange} placeholder="jane@example.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select name="role" className="form-control" value={formData.role} onChange={handleChange}>
              <option value="CUSTOMER">Customer</option>
              <option value="AGENT">Delivery Agent</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', padding: '12px', marginTop: '16px' }}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
          <button 
            onClick={onGoToLogin} 
            style={{ color: '#2563eb', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Already have an account? Log in here.
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;