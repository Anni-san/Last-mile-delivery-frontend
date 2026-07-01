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

  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Handle typing in the form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setCalculatedPrice(null); // Hide price if they change dimensions
    setOrderSuccess(false);
  };

  // Mock function to simulate your backend math engine
  const handleCalculate = (e) => {
    e.preventDefault();
    // In the real app, this will be a fetch() to your backend
    const mockPrice = (parseFloat(formData.actualWeight || 2) * 45.5).toFixed(2);
    setCalculatedPrice(mockPrice);
  };

  // Mock function to simulate booking the order
  const handleBookOrder = () => {
    setOrderSuccess(true);
    setCalculatedPrice(null);
    setFormData({ pickupZoneId: '1', dropZoneId: '2', actualWeight: '', length: '', breadth: '', height: '' });
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

        {orderSuccess && (
          <div className="alert-success">
            Success! Your order has been placed and an agent is being assigned.
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
              <input type="number" className="form-control" name="actualWeight" placeholder="e.g. 2.5" required
                value={formData.actualWeight} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Length (CM)</label>
              <input type="number" className="form-control" name="length" placeholder="e.g. 30" required
                value={formData.length} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Breadth (CM)</label>
              <input type="number" className="form-control" name="breadth" placeholder="e.g. 20" required
                value={formData.breadth} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Height (CM)</label>
              <input type="number" className="form-control" name="height" placeholder="e.g. 15" required
                value={formData.height} onChange={handleInputChange} />
            </div>
          </div>

          {!calculatedPrice && !orderSuccess && (
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '12px' }}>
              Calculate Price
            </button>
          )}
        </form>

        {calculatedPrice && (
          <div className="price-display">
            <h3>Estimated Total Charge</h3>
            <p className="price-amount">${calculatedPrice}</p>
            <button className="btn btn-primary" onClick={handleBookOrder} style={{ width: '100%', marginTop: '16px', padding: '12px' }}>
              Confirm & Book Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPortal;