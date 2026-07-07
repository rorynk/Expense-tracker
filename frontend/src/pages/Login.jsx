import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login({ email, password });
    if (ok) navigate('/');
  };

  return (
    <div className="sheet form-sheet">
      <h1 className="page-title">Welcome back</h1>
      <p className="page-subtitle" style={{ marginBottom: 24 }}>
        Log in to see where your money went.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>

          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', paddingRight: '40px' }}
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button
          type="submit"
          className="btn primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;