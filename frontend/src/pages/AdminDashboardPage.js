import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_BASE_ADMIN = `${API_BASE}/admin`;

function AdminDashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, ready: 0, completed: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchAllBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_BASE_ADMIN}/bookings`, config);
      setBookings(response.data);
    } catch (err) {
      setError('Admin access denied.');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_BASE_ADMIN}/stats`, config);
      setStats(response.data);
    } catch (err) {
      console.error("Stats fetch failed");
    }
  }, []);

  useEffect(() => {
    fetchAllBookings();
    fetchStats();
  }, [fetchAllBookings, fetchStats]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_BASE_ADMIN}/bookings/${bookingId}/status`, { status: newStatus }, config);
      setMessage("Status updated successfully!");
      fetchAllBookings();
      fetchStats(); // Update stats as well
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  // --- LOGIC: Return se pehle filtering karein ---
  const filteredBookings = bookings.filter(b => 
    b.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dark-container">
      <div className="admin-header-modern">
        <div className="title-section">
          <h1 className="admin-main-title">Admin Dashboard</h1>
          <p className="admin-sub-text">Managing {bookings.length} total customer requests</p>
        </div>
        <button onClick={handleLogout} className="admin-logout-pill">Logout</button>
      </div>

      {/* Stats Section */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Bookings</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card active-border">
          <span className="stat-label">Active Services</span>
          <span className="stat-value text-blue">{stats.active}</span>
        </div>
        <div className="stat-card ready-border">
          <span className="stat-label">Ready for Pickup</span>
          <span className="stat-value text-green">{stats.ready}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{stats.completed}</span>
        </div>
      </div>

      {/* Actions Bar (Search + Results) */}
      <div className="admin-actions-bar">
        <div className="left-actions">
          <span className="results-count">Results: {filteredBookings.length}</span>
        </div>
        <div className="search-wrapper compact">
          <span className="search-icon">🔍 </span>
          <input 
            type="text" 
            placeholder="Search by reg no..." 
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrapper">
        {error && <div className="alert-dark error">{error}</div>}
        {message && <div className="alert-dark success">{message}</div>}

        <table className="admin-custom-table">
          <thead>
            <tr>
              <th className="col-customer">Customer</th>
              <th className="col-vehicle">Vehicle</th>
              <th className="col-service">Service</th>
              <th className="col-schedule">Schedule</th>
              <th className="col-status">Status Update</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="info-stack">
                      <span className="name-primary">{b.user_name}</span>
                      <span className="email-secondary">{b.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="info-stack">
                      <span className="vehicle-primary">{b.make} {b.model}</span>
                      <span className="reg-accent">{b.registration_number}</span>
                    </div>
                  </td>
                  <td><span className="badge-service">{b.service_type}</span></td>
                  <td>
                    <div className="info-stack">
                      <span className="date-primary">{new Date(b.booking_date).toLocaleDateString()}</span>
                      <span className="time-secondary">{b.time_slot}</span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-status-cell">
                      <div className="admin-mini-progress">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${
                            b.status === 'Booking Confirmed' ? '20%' :
                            b.status === 'Vehicle Dropped Off' ? '40%' :
                            b.status === 'Service In Progress' ? '60%' :
                            b.status === 'Service Completed' ? '80%' :
                            b.status === 'Ready for Pickup' ? '100%' : '0%'
                          }` }}
                        ></div>
                      </div>
                      <div className="select-wrapper">
                        <select 
                          className={`status-select-premium status-${(b.status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}
                          value={b.status} 
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        >
                          <option value="Booking Confirmed">Booking Confirmed</option>
                          <option value="Vehicle Dropped Off">Vehicle Dropped Off</option>
                          <option value="Service In Progress">Service In Progress</option>
                          <option value="Service Completed">Service Completed</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="no-data">No results found for "{searchTerm}"</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboardPage;