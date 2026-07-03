import React, { useState } from 'react';
import AgentDashboard from './AgentDashboard';
import Dashboard from './Dashboard';
import CustomerPortal from './CustomerPortal';
import Login from './Login';
import Register from './Register'; // --- NEW IMPORT ---

function App() {
  // state to hold the logged-in user. If null, show the login page.
  const [user, setUser] = useState(null);
  
  // --- NEW STATE: Toggle between Login and Register ---
  const [showRegister, setShowRegister] = useState(false); 

  const handleLogout = () => {
    localStorage.removeItem('token'); // Destroy the security token
    setUser(null); // Return to login screen
  };

  // If no user is logged in, ONLY show the login screen or register screen
  if (!user) {
    if (showRegister) {
      return <Register onGoToLogin={() => setShowRegister(false)} />;
    }
    return <Login onLogin={setUser} onGoToRegister={() => setShowRegister(true)} />;
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
        {user.role === 'CUSTOMER' && <CustomerPortal />}
        {user.role === 'ADMIN' && <Dashboard />}
        {/* Pass the user object so the dashboard knows the agent's ID */}
        {user.role === 'AGENT' && <AgentDashboard user={user} />}
      </main>
    </div>
  );
}

export default App;