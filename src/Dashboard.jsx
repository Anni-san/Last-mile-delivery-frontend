import React, { useState } from 'react';
import './index.css';

const Dashboard = () => {
  // 1. Extended mock data for a realistic feel
  const [mockOrders] = useState([
    { id: 1042, customer: 'Acme Corp', status: 'Assigned', charge: '162.00', date: '2026-07-01' },
    { id: 1043, customer: 'Global Tech', status: 'Pending', charge: '210.50', date: '2026-07-02' },
    { id: 1044, customer: 'Sarah Jenkins', status: 'In Transit', charge: '145.00', date: '2026-07-02' },
  ]);

  // 2. React State to handle the working buttons
  const [selectedOrder, setSelectedOrder] = useState(null);

  const openModal = (order) => setSelectedOrder(order);
  const closeModal = () => setSelectedOrder(null);

  return (
    <div className="layout-background">
      <div className="dashboard-container">
        
        {/* Premium Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="brand-title">Logistics Command Center</h1>
            <p className="brand-subtitle">Manage deliveries, track history, and monitor agents.</p>
          </div>
          <div className="user-profile">
            <div className="avatar">A</div>
            <span>Admin Portal</span>
          </div>
        </header>

        {/* Data Table Card */}
        <div className="card shadow-sm">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total Charge</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map(order => (
                <tr key={order.id} className="table-row">
                  <td className="font-medium text-dark">#{order.id}</td>
                  <td>{order.customer}</td>
                  <td className="text-muted">{order.date}</td>
                  <td>
                    <span className={`badge badge-${order.status.toLowerCase().replace(' ', '-')}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="font-medium">${order.charge}</td>
                  <td>
                    {/* The working button! */}
                    <button className="btn btn-outline" onClick={() => openModal(order)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interactive Modal Overlay */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              
              <div className="modal-header">
                <h2>Order #{selectedOrder.id}</h2>
                <button className="btn-close" onClick={closeModal}>&times;</button>
              </div>
              
              <div className="modal-body">
                <div className="detail-row">
                  <span className="text-muted">Customer:</span>
                  <span className="font-medium">{selectedOrder.customer}</span>
                </div>
                <div className="detail-row">
                  <span className="text-muted">Current Status:</span>
                  <span className={`badge badge-${selectedOrder.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="text-muted">Calculated Charge:</span>
                  <span className="font-medium">${selectedOrder.charge}</span>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={closeModal}>Close Window</button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;