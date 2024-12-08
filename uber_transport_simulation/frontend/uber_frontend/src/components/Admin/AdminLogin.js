import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext
import './AdminLogin.css';


const AdminLogin = () => {
  const { loginAdmin } = useContext(AuthContext); // Access loginAdmin from context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // For success message
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccessMessage(null); // Clear previous messages

    if (!username || !password) {
      setError('Username and password are required!');
      return;
    }

    try {
      const success = await loginAdmin(username, password);

      if (success) {
        setSuccessMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/admin/dashboard'); // Redirect to the admin dashboard after successful login
        }, 600);
      } else {
        setError('Invalid username or password.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('An error occurred during login.');
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
