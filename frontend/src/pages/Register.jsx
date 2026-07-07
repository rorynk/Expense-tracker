import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await register({ name, email, password });
    if (ok) navigate('/');
  };

  return (
    <div className="sheet form-sheet">
      <h1 className="page-title">Open a ledger</h1>

      <p className="page-subtitle" style={{ marginBottom: 24 }}>
        Takes about 20 seconds.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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
              minLength={6}
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
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Register;