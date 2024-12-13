import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = 'login-page';
    return () => {
      document.body.className = ''; // Clean up the class when the component unmounts
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('https://project-1-m2bn.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Optionally store the token or user info if provided by the backend
        localStorage.setItem('authToken', data.token || ''); // Adjust based on backend response
        navigate('/app'); // Redirect to /app or desired route
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to log in');
      }
    } catch (err) {
      setError('Failed to log in');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default Login;
