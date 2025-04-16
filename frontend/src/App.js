import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import logo from './logo.png';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('candidate');

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.username && user?.role) {
        navigate('/dashboard');
      }
    } catch {
      localStorage.removeItem('user');
    }
  }, [navigate]);

  const handleSubmit = () => {
    const payload = {
      username,
      password,
      role,
      ...(role === 'candidate' ? { location } : { company })
    };

    fetch(`http://localhost:5000/${isLogin ? 'login' : 'signup'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          console.log(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/dashboard');
        } else {
          alert(data.message || 'Success');
        }
      })
      .catch(() => alert('Error connecting to server'));
  };

  return (
    <div className="App">
      <header className="header">
        <div className="logo-section">
          <div className="logo">AI-powered-talent-matching-MVP</div>
          <div className="subtext">Smart Digital Solution for Hiring</div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-left">
          <img src={logo} alt="logo" />
        </div>
        <div className="hero-right">
          <div className="auth-box">
            <h3>{isLogin ? 'Login' : 'Sign Up'}</h3>

            {/* 用户身份选择 */}
            <div className="role-options">
  <label>
    <input
      type="radio"
      name="role"
      value="candidate"
      checked={role === 'candidate'}
      onChange={() => setRole('candidate')}
    />
    Candidate
  </label>
  <label>
    <input
      type="radio"
      name="role"
      value="employer"
      checked={role === 'employer'}
      onChange={() => setRole('employer')}
    />
    Employer
  </label>
</div>


            {/* 通用字段 */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {/* 个性字段 */}
            {!isLogin && role === 'candidate' && (
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            )}
            {!isLogin && role === 'employer' && (
              <input
                type="text"
                placeholder="Company Name"
                value={company}
                onChange={e => setCompany(e.target.value)}
              />
            )}

            <button className="submit-button" onClick={handleSubmit}>
              {isLogin ? 'Log in' : 'Sign up'}
            </button>

            <div className="switch-mode" style={{ marginTop: '15px' }}>
              <span>
                {isLogin
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <button onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-box">
          <h3>Platform</h3>
          <p>A full-featured online communication platform for all users.</p>
        </div>
        <div className="feature-box">
          <h3>Machine Learning</h3>
          <p>Utilizing the latest machine learning algorithms to assist with high accuracy.</p>
        </div>
        <div className="feature-box">
          <h3>User-oriented</h3>
          <p>Customized personalization for users, offering user-friendly functions and interfaces.</p>
        </div>
      </section>

      <footer className="footer">
        © 2025 AI Talent Matching. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
