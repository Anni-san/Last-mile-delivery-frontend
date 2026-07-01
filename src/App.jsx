import React, { useState } from 'react';
import Dashboard from './Dashboard';
import CustomerPortal from './CustomerPortal';
import Login from './Login';

function App() {
  // state to hold the logged-in user. If null, show the login page.
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null); // Clears the user and throws them back to the login screen
  };

  // If no user is logged in, ONLY show the login screen
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // If they are logged in, show a minimal header just for logging out
  return (
    <div className="App">
      <nav className="top-nav" style={{ justifyContent: 'space-between' }}>
        <div className="nav-brand">TrackFlow Logistics</div>
        <div className="user-profile" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
          <span className="text-muted" style={{ marginRight: '12px', fontSize: '0.9rem' }}>
            Logged in as {user.role}
          </span>
          <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '6px 12px' }}>
            Log Out
          </button>
        </div>
      </nav>

      <main>
        {/* Strictly enforce view based on role */}
        {user.role === 'CUSTOMER' && <CustomerPortal />}
        {user.role === 'ADMIN' && <Dashboard />}
        {user.role === 'AGENT' && (
          <div className="layout-background">
             <div className="form-card"><h2 style={{margin: 0}}>Agent Dashboard (Coming Soon)</h2></div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;