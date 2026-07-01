import React, { useState } from 'react';
import Dashboard from './Dashboard';
import CustomerPortal from './CustomerPortal';

function App() {
  // We use this state to track which page the user is currently viewing
  const [currentView, setCurrentView] = useState('customer');

  return (
    <div className="App">
      {/* Global Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-brand">TrackFlow Logistics</div>
        <div className="nav-links">
          <button 
            className={`nav-btn ${currentView === 'customer' ? 'active' : ''}`}
            onClick={() => setCurrentView('customer')}
          >
            Customer Booking
          </button>
          <button 
            className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentView('admin')}
          >
            Admin Dashboard
          </button>
        </div>
      </nav>

      {/* Render the correct component based on state */}
      <main>
        {currentView === 'customer' && <CustomerPortal />}
        {currentView === 'admin' && <Dashboard />}
      </main>
    </div>
  );
}

export default App;