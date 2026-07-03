import React, { useState, useEffect } from 'react';
import './index.css';

const Dashboard = () => {
  // --- EXISTING STATE ---
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const openModal = (order) => setSelectedOrder(order);
  const closeModal = () => setSelectedOrder(null);

  // --- NEW STATE: Filters ---
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAgent, setFilterAgent] = useState('');

  // --- NEW STATE: Create Order on behalf of Customer ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    customerId: '', pickupZoneId: '1', dropZoneId: '2', actualWeight: '', length: '', breadth: '', height: ''
  });
  const [calcDetails, setCalcDetails] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // --- HOISTED FETCH FUNCTION ---
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

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- NEW LOGIC: Filter Orders ---
  const filteredOrders = orders.filter(order => {
    const matchStatus = filterStatus ? order.status === filterStatus : true;
    const matchAgent = filterAgent ? String(order.agent_id) === filterAgent : true;
    return matchStatus && matchAgent;
  });

  // --- NEW LOGIC: Admin Order Creation ---
  const handleCreateInputChange = (e) => {
    setCreateFormData({ ...createFormData, [e.target.name]: e.target.value });
    setCalcDetails(null);
  };

  const handleCalculateOrder = async (e) => {
    e.preventDefault();
    setIsCalculating(true);
    try {
      const response = await fetch('http://localhost:5000/api/rates/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...createFormData, orderType: 'B2C', isCOD: false })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setCalcDetails({
        chargeableWeight: data.chargeableWeight,
        totalCharge: data.totalCharge,
        volumetricWeight: ((createFormData.length * createFormData.breadth * createFormData.height) / 5000).toFixed(2)
      });
    } catch (err) {
      alert(`Calculation Error: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAdminBookOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          customerId: createFormData.customerId, 
          pickupZoneId: createFormData.pickupZoneId,
          dropZoneId: createFormData.dropZoneId,
          actualWeight: createFormData.actualWeight,
          volumetricWeight: calcDetails.volumetricWeight,
          chargeableWeight: calcDetails.chargeableWeight,
          totalCharge: calcDetails.totalCharge
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert('Order successfully created on behalf of customer!');
      setIsCreateModalOpen(false);
      setCalcDetails(null);
      setCreateFormData({ customerId: '', pickupZoneId: '1', dropZoneId: '2', actualWeight: '', length: '', breadth: '', height: '' });
      fetchOrders(); // Refresh table immediately
    } catch (err) {
      alert(`Booking Error: ${err.message}`);
    }
  };

  return (
    <div className="layout-background">
      <div className="dashboard-container">
        
        <header className="dashboard-header" style={{ alignItems: 'center' }}>
          <div>
            <h1 className="brand-title">Logistics Command Center</h1>
            <p className="brand-subtitle">Manage live deliveries and monitor agents.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
              + Create Order
            </button>
            <div className="user-profile">
              <div className="avatar">A</div>
              <span>Admin Portal</span>
            </div>
          </div>
        </header>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* --- NEW: FILTERS --- */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <select className="form-control" style={{ width: '200px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="Picked Up">Picked Up</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Failed">Failed</option>
          </select>
          
          <input 
            type="number" 
            className="form-control" 
            style={{ width: '200px' }} 
            placeholder="Filter by Agent ID..." 
            value={filterAgent} 
            onChange={(e) => setFilterAgent(e.target.value)} 
          />
        </div>

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
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No orders match your filters.</td></tr>
              ) : (
                filteredOrders.map(order => (
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

        {/* --- EXISTING: DETAILS & ASSIGNMENT MODAL --- */}
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
                
                <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <span className="text-muted">Assigned Agent ID:</span>
                  {selectedOrder.agent_id ? (
                    <span className="font-medium">{selectedOrder.agent_id}</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <input type="number" id="manualAgentId" className="form-control" placeholder="Enter Agent ID (e.g., 3)" style={{ padding: '6px' }} />
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
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ agentId: inputVal })
                            });
                            if (res.ok) {
                              alert('Agent successfully assigned!');
                              closeModal();
                              fetchOrders();
                            } else {
                              alert('Assignment failed.');
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >Assign</button>
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

        {/* --- NEW: CREATE ORDER MODAL --- */}
        {isCreateModalOpen && (
          <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h2>Create Order on Behalf of Customer</h2>
                <button className="btn-close" onClick={() => setIsCreateModalOpen(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCalculateOrder}>
                  <div className="form-grid">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Customer ID</label>
                      <input type="number" className="form-control" name="customerId" required value={createFormData.customerId} onChange={handleCreateInputChange} placeholder="e.g. 1" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pickup Zone</label>
                      <select className="form-control" name="pickupZoneId" value={createFormData.pickupZoneId} onChange={handleCreateInputChange}>
                        <option value="1">Zone A</option>
                        <option value="2">Zone B</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Drop Zone</label>
                      <select className="form-control" name="dropZoneId" value={createFormData.dropZoneId} onChange={handleCreateInputChange}>
                        <option value="1">Zone A</option>
                        <option value="2">Zone B</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Weight (KG)</label><input type="number" step="0.1" className="form-control" name="actualWeight" required value={createFormData.actualWeight} onChange={handleCreateInputChange} /></div>
                    <div className="form-group"><label className="form-label">Length (CM)</label><input type="number" step="0.1" className="form-control" name="length" required value={createFormData.length} onChange={handleCreateInputChange} /></div>
                    <div className="form-group"><label className="form-label">Breadth (CM)</label><input type="number" step="0.1" className="form-control" name="breadth" required value={createFormData.breadth} onChange={handleCreateInputChange} /></div>
                    <div className="form-group"><label className="form-label">Height (CM)</label><input type="number" step="0.1" className="form-control" name="height" required value={createFormData.height} onChange={handleCreateInputChange} /></div>
                  </div>
                  {!calcDetails && (
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>{isCalculating ? 'Calculating...' : 'Calculate Price'}</button>
                  )}
                </form>

                {calcDetails && (
                  <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                    <h4>Calculated Charge: ${calcDetails.totalCharge}</h4>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>Billed Weight: {calcDetails.chargeableWeight}kg</p>
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={handleAdminBookOrder}>Confirm & Create Order</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;