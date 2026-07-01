import React, { useState, useEffect } from 'react';
import './index.css';

const AgentDashboard = ({ user }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch live orders when the dashboard loads
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Filter: Only show orders assigned to THIS specific logged-in agent
        const myDeliveries = data.filter(order => order.agent_id === user.id);
        setDeliveries(myDeliveries);

      } catch (err) {
        setError("Failed to fetch live deliveries.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user.id]);

  // 2. Connect buttons to the Database & Email system
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Instantly update the UI badge
      setDeliveries(deliveries.map(delivery => 
        delivery.id === orderId ? { ...delivery, status: newStatus } : delivery
      ));

      // Quick visual feedback that the database saved it and the email fired
      alert(`Success! Order #${orderId} marked as '${newStatus}'. Email notification triggered.`);

    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="layout-background">
      <div className="dashboard-container">
        
        <header className="dashboard-header">
          <div>
            <h1 className="brand-title">Driver Manifest</h1>
            <p className="brand-subtitle">View your route and update live delivery statuses.</p>
          </div>
        </header>

        {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

        <div className="form-grid">
          {isLoading ? (
            <p>Loading your route...</p>
          ) : deliveries.length === 0 ? (
            <div className="card shadow-sm" style={{ padding: '24px', gridColumn: 'span 2', textAlign: 'center' }}>
              <p className="text-muted">You have no assigned deliveries right now.</p>
            </div>
          ) : (
            deliveries.map(delivery => (
              <div key={delivery.id} className="card shadow-sm" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>Order #{delivery.id}</h3>
                  <span className={`badge badge-${delivery.status ? delivery.status.toLowerCase().replace(' ', '-') : 'pending'}`}>
                    {delivery.status || 'ASSIGNED'}
                  </span>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <p className="text-muted" style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>
                    <strong>Customer ID:</strong> {delivery.customer_id}
                  </p>
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>Chargeable Weight:</strong> {delivery.chargeable_weight} kg
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <p className="form-label">Update Status</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" onClick={() => handleStatusUpdate(delivery.id, 'Picked Up')}>
                      Picked Up
                    </button>
                    <button className="btn btn-outline" onClick={() => handleStatusUpdate(delivery.id, 'In Transit')}>
                      In Transit
                    </button>
                    <button className="btn btn-primary" onClick={() => handleStatusUpdate(delivery.id, 'Delivered')} style={{ backgroundColor: '#166534', borderColor: '#166534' }}>
                      Delivered
                    </button>
                    <button className="btn btn-primary" onClick={() => handleStatusUpdate(delivery.id, 'Failed')} style={{ backgroundColor: '#991b1b', borderColor: '#991b1b' }}>
                      Failed
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default AgentDashboard;