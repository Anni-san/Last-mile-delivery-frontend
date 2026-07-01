import React, { useState } from 'react';
import './index.css';

const AgentDashboard = () => {
  // Mock data for assigned deliveries
  const [deliveries, setDeliveries] = useState([
    { id: 1042, address: '123 Downtown Ave, Zone A', status: 'Assigned', customer: 'Acme Corp' },
    { id: 1045, address: '456 Suburb Ln, Zone B', status: 'Picked Up', customer: 'John Doe' }
  ]);

  // Mock function to handle the status update button clicks
  const handleStatusUpdate = (id, newStatus) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === id ? { ...delivery, status: newStatus } : delivery
    ));
    // In production, this triggers the PUT /api/orders/:id/status route 
    // which fires the email and logs the immutable history.
  };

  return (
    <div className="layout-background">
      <div className="dashboard-container">
        
        <header className="dashboard-header">
          <div>
            <h1 className="brand-title">Driver Manifest</h1>
            <p className="brand-subtitle">View your route and update delivery statuses.</p>
          </div>
        </header>

        <div className="form-grid">
          {deliveries.map(delivery => (
            <div key={delivery.id} className="card shadow-sm" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Order #{delivery.id}</h3>
                <span className={`badge badge-${delivery.status.toLowerCase().replace(' ', '-')}`}>
                  {delivery.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <p className="text-muted" style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>
                  <strong>Customer:</strong> {delivery.customer}
                </p>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                  <strong>Destination:</strong> {delivery.address}
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
          ))}
        </div>

      </div>
    </div>
  );
};

export default AgentDashboard;