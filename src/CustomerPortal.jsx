import React, { useState } from 'react';
import './index.css';

const CustomerPortal = () => {
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setCalculationDetails(null); 
    setOrderSuccess(false);
    setError('');
  };

  // 1. Talk to the backend Math Engine
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
          orderType: 'B2C', // Defaulting to B2C for this MVP
          isCOD: false      // Defaulting to Prepaid
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to calculate rate.');

      // Save the math results so we can show them and use them to book the order
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

  // 2. Trigger the Auto-Assignment Order Creation
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
          customerId: 1, // Hardcoded for this assignment MVP
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

      // Success!
      setOrderSuccess(true);
      setCalculationDetails(null);
      setFormData({ pickupZoneId: '1', dropZoneId: '2', actualWeight: '', length: '', breadth: '', height: '' });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="layout-background">
      <div className="form-card">
        <header className="dashboard-header" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="brand-title">Book a Delivery</h1>
            <p className="brand-subtitle">Enter package details for an instant quote.</p>
          </div>
        </header>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {orderSuccess && (
          <div className="alert-success" style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '16px', borderRadius: '6px', marginBottom: '24px', border: '1px solid #bbf7d0', fontWeight: '500' }}>
            Success! Your order has been placed and is routing to the nearest agent.
          </div>
        )}

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
              <input type="number" step="0.1" className="form-control" name="actualWeight" placeholder="e.g. 2.5" required
                value={formData.actualWeight} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Length (CM)</label>
              <input type="number" step="0.1" className="form-control" name="length" placeholder="e.g. 30" required
                value={formData.length} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Breadth (CM)</label>
              <input type="number" step="0.1" className="form-control" name="breadth" placeholder="e.g. 20" required
                value={formData.breadth} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Height (CM)</label>
              <input type="number" step="0.1" className="form-control" name="height" placeholder="e.g. 15" required
                value={formData.height} onChange={handleInputChange} />
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
            <p style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>
              ${calculationDetails.totalCharge}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0' }}>
              Billed on Chargeable Weight: {calculationDetails.chargeableWeight}kg
            </p>
            <button className="btn btn-primary" onClick={handleBookOrder} disabled={isLoading} style={{ width: '100%', padding: '12px', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Booking...' : 'Confirm & Book Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPortal;