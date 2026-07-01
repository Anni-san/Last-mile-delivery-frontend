import React, { useState, useEffect } from 'react';
import './index.css';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const openModal = (order) => setSelectedOrder(order);
  const closeModal = () => setSelectedOrder(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch live data.");
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="layout-background">
      <div className="dashboard-container">
        
        <header className="dashboard-header">
          <div>
            <h1 className="brand-title">Logistics Command Center</h1>
            <p className="brand-subtitle">Manage live deliveries and monitor agents.</p>
          </div>
          <div className="user-profile">
            <div className="avatar">A</div>
            <span>Admin Portal</span>
          </div>
        </header>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div className="card shadow-sm">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total Charge</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading live orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No orders found in database.</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="table-row">
                    <td className="font-medium text-dark">#{order.id}</td>
                    <td>{order.customer_id || 'Guest'}</td>
                    <td className="text-muted">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge badge-${order.status ? order.status.toLowerCase().replace(' ', '-') : 'pending'}`}>
                        {order.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="font-medium">${order.total_charge}</td>
                    <td>
                      <button className="btn btn-outline" onClick={() => openModal(order)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Interactive Modal Overlay with Assignment Logic */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Order #{selectedOrder.id} Details</h2>
                <button className="btn-close" onClick={closeModal}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <span className="text-muted">Customer ID:</span>
                  <span className="font-medium">{selectedOrder.customer_id || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="text-muted">Current Status:</span>
                  <span className={`badge badge-${selectedOrder.status ? selectedOrder.status.toLowerCase().replace(' ', '-') : 'pending'}`}>
                    {selectedOrder.status || 'PENDING'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="text-muted">Calculated Charge:</span>
                  <span className="font-medium">${selectedOrder.total_charge}</span>
                </div>
                
                {/* THIS IS THE NEW ASSIGNMENT BOX */}
                <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <span className="text-muted">Assigned Agent ID:</span>
                  {selectedOrder.agent_id ? (
                    <span className="font-medium">{selectedOrder.agent_id}</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <input 
                        type="number" 
                        id="manualAgentId"
                        className="form-control" 
                        placeholder="Enter Agent ID (e.g., 3)" 
                        style={{ padding: '6px' }}
                      />
                      <button 
                        className="btn btn-primary" 
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={async () => {
                          const inputVal = document.getElementById('manualAgentId').value;
                          if (!inputVal) return alert('Please enter an Agent ID');
                          
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`http://localhost:5000/api/orders/${selectedOrder.id}/assign`, {
                              method: 'PUT',
                              headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` 
                              },
                              body: JSON.stringify({ agentId: inputVal })
                            });
                            
                            if (res.ok) {
                              alert('Agent successfully assigned!');
                              window.location.reload(); 
                            } else {
                              alert('Assignment failed. Check if server route exists.');
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        Assign
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={closeModal}>Close Window</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;