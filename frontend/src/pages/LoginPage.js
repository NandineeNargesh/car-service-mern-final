import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminDashboardPage from './AdminDashboardPage';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post(
        `${API_BASE}/auth/login`, // Change to Render URL for production
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // LoginPage.js ke handleSubmit mein change karein
// handleSubmit ke andar response aane ke baad ye daaliye:
const { token, user } = response.data;
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Role ke hisaab se Force Redirect
if (user.is_admin === true || String(user.is_admin) === 'true') {
    window.location.href = '/admin/dashboard'; 
} else {
    window.location.href = '/dashboard';
}
    } catch (error) {
      if (error.response && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="logo-auth">CarServices</h1>
        <h2>Welcome Back!</h2>
        <p>Please log in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary">Log In</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <p className="auth-switch">Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
}

export default LoginPage;
