import React, { useState, useEffect } from 'react';
import './index.css';

const CustomerPortal = () => {
  // --- EXISTING STATE ---
  const [formData, setFormData] = useState({
    pickupZoneId: '1',
    dropZoneId: '2',
    actualWeight: '',
    length: '',
    breadth: '',
    height: ''
  });
  const [calculationDetails, setCalculationDetails] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW STATE FOR PHASE 2 ---
  const [orders, setOrders] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [activeTimelineOrderId, setActiveTimelineOrderId] = useState(null);

  // --- NEW FUNCTION: Fetch Customer's Orders ---
  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Filter to only show Customer 1's orders (since we hardcoded ID 1 in the booking)
        const myOrders = data.filter(order => String(order.customer_id) === '1');
        setOrders(myOrders);
      }
    } catch (err) {
      console.error("Failed to load orders.");
    }
  };

  // Fetch orders when the page loads
  useEffect(() => {
    fetchMyOrders();
  }, []);

  // --- NEW FUNCTION: View Timeline ---
  const fetchTimeline = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setTimeline(data);
        setActiveTimelineOrderId(orderId);
      }
    } catch (err) {
      alert("Failed to load timeline.");
    }
  };

  // --- NEW FUNCTION: Reschedule Failed Order ---
  const handleReschedule = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/reschedule`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();

      if (response.ok) {
        alert("Success! Your order has been reset and will be assigned to a new driver shortly.");
        fetchMyOrders(); // Refresh the list without reloading the page
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to reschedule.");
    }
  };

  // --- EXISTING FUNCTIONS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setCalculationDetails(null); 
    setOrderSuccess(false);
    setError('');
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/rates/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          orderType: 'B2C',
          isCOD: false 
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to calculate rate.');

      setCalculationDetails({
        chargeableWeight: data.chargeableWeight,
        totalCharge: data.totalCharge,
        volumetricWeight: ((formData.length * formData.breadth * formData.height) / 5000).toFixed(2)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookOrder = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          customerId: 1, 
          pickupZoneId: formData.pickupZoneId,
          dropZoneId: formData.dropZoneId,
          actualWeight: formData.actualWeight,
          volumetricWeight: calculationDetails.volumetricWeight,
          chargeableWeight: calculationDetails.chargeableWeight,
          totalCharge: calculationDetails.totalCharge
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order.');

      setOrderSuccess(true);
      setCalculationDetails(null);
      setFormData({ pickupZoneId: '1', dropZoneId: '2', actualWeight: '', length: '', breadth: '', height: '' });
      fetchMyOrders(); // Instantly update the list below!
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="layout-background">
      <div className="dashboard-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* --- BOOKING FORM SECTION --- */}
        <div className="form-card" style={{ marginBottom: '40px' }}>
          <header className="dashboard-header" style={{ marginBottom: '24px' }}>
            <div>
              <h1 className="brand-title">Book a Delivery</h1>
              <p className="brand-subtitle">Enter package details for an instant quote.</p>
            </div>
          </header>

          {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
          {orderSuccess && <div className="alert-success" style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '16px', borderRadius: '6px', marginBottom: '24px', border: '1px solid #bbf7d0', fontWeight: '500' }}>Success! Your order has been placed and is routing to the nearest agent.</div>}

          <form onSubmit={handleCalculate}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Pickup Zone</label>
                <select className="form-control" name="pickupZoneId" value={formData.pickupZoneId} onChange={handleInputChange}>
                  <option value="1">Zone A (Downtown)</option>
                  <option value="2">Zone B (Suburbs)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Drop Zone</label>
                <select className="form-control" name="dropZoneId" value={formData.dropZoneId} onChange={handleInputChange}>
                  <option value="1">Zone A (Downtown)</option>
                  <option value="2">Zone B (Suburbs)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Actual Weight (KG)</label>
                <input type="number" step="0.1" className="form-control" name="actualWeight" placeholder="e.g. 2.5" required value={formData.actualWeight} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Length (CM)</label>
                <input type="number" step="0.1" className="form-control" name="length" placeholder="e.g. 30" required value={formData.length} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Breadth (CM)</label>
                <input type="number" step="0.1" className="form-control" name="breadth" placeholder="e.g. 20" required value={formData.breadth} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Height (CM)</label>
                <input type="number" step="0.1" className="form-control" name="height" placeholder="e.g. 15" required value={formData.height} onChange={handleInputChange} />
              </div>
            </div>

            {!calculationDetails && !orderSuccess && (
              <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '16px', padding: '12px', opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'Calculating...' : 'Calculate Price'}
              </button>
            )}
          </form>

          {calculationDetails && (
            <div className="price-display" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '20px', borderRadius: '8px', textAlign: 'center', margin: '24px 0' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>Estimated Total Charge</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>${calculationDetails.totalCharge}</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0' }}>Billed on Chargeable Weight: {calculationDetails.chargeableWeight}kg</p>
              <button className="btn btn-primary" onClick={handleBookOrder} disabled={isLoading} style={{ width: '100%', padding: '12px', opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'Booking...' : 'Confirm & Book Order'}
              </button>
            </div>
          )}
        </div>

        {/* --- MY ORDERS & TIMELINE SECTION --- */}
        <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '24px' }}>My Active Deliveries</h2>
        
        {orders.length === 0 ? (
          <p className="text-muted">You have no past or active orders.</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {orders.map(order => (
              <div key={order.id} className="card shadow-sm" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                  <span className={`badge badge-${order.status ? order.status.toLowerCase().replace(' ', '-') : 'pending'}`}>
                    {order.status || 'PENDING'}
                  </span>
                </div>
                
                <p className="text-muted" style={{ margin: '0 0 16px 0', fontSize: '0.9rem' }}>
                  <strong>Total Charge:</strong> ${order.total_charge}
                </p>

                {/* Timeline & Reschedule Actions */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" onClick={() => fetchTimeline(order.id)}>
                    View Timeline
                  </button>
                  
                  {order.status === 'Failed' && (
                    <button className="btn btn-primary" onClick={() => handleReschedule(order.id)} style={{ backgroundColor: '#2563eb' }}>
                      Reschedule Delivery
                    </button>
                  )}
                </div>

                {/* Timeline Dropdown */}
                {activeTimelineOrderId === order.id && (
                  <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>Tracking History</h4>
                    {timeline.length === 0 ? (
                      <p className="text-muted" style={{ margin: 0 }}>No history available yet.</p>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {timeline.map((event, index) => (
                          <li key={index} style={{ marginBottom: '8px' }}>
                            <strong>{event.status}</strong> 
                            <span className="text-muted" style={{ marginLeft: '8px', fontSize: '0.85rem' }}>
                              ({new Date(event.created_at).toLocaleString()})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="btn btn-outline" style={{ marginTop: '12px', padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => setActiveTimelineOrderId(null)}>
                      Close Timeline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerPortal;