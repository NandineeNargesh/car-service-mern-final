import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_URL = `${API_BASE}/bookings/history`;

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const fetchBookingHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found.');

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      setBookings(response.data);
    } catch (err) {
      setError('Could not load your booking history.');
    }
  }, []);

  useEffect(() => {
    fetchBookingHistory();
  }, [fetchBookingHistory]);

  const formatDate = (dateString) => {
    if(!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="content-section">
      <h2>My Booking History</h2>
      {error && <p className="auth-message error">{error}</p>}
      
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Service Type</th>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                // ⚠️ MongoDB uses _id
                <tr key={booking._id}>
                  <td>
                    {/* ⚠️ Mongoose populate data access */}
                    {booking.vehicle_id?.make 
                      ? `${booking.vehicle_id.make} ${booking.vehicle_id.model}` 
                      : 'Unknown Vehicle'}
                  </td>
                  <td>{booking.service_type}</td>
                  <td>{formatDate(booking.booking_date)}</td>
                  <td>{booking.time_slot}</td>
                  <td>
                    <span className={`status-badge status-${(booking.status || 'Pending').toLowerCase()}`}>
                      {booking.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>
                  No bookings found. Please book a service first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookingHistory;