import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import './HomepageLogin.css';

const HomepageLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  
  // Message states
  const [loginMsg, setLoginMsg] = useState({ text: '', type: '' });
  const [signupMsg, setSignupMsg] = useState({ text: '', type: '' });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Smooth progress animation
  useEffect(() => {
    const animateProgress = () => {
      if (currentProgress !== targetProgress) {
        const step = targetProgress > currentProgress ? 1 : -1;
        setCurrentProgress(prev => prev + step);
        
        if (progressFillRef.current) {
          progressFillRef.current.style.width = `${currentProgress}%`;
        }
        
        requestAnimationFrame(animateProgress);
      }
    };
    
    requestAnimationFrame(animateProgress);
  }, [currentProgress, targetProgress]);

  // Calculate progress based on input length and focus
  const updateProgress = (form: 'login' | 'signup') => {
    const inputs = form === 'login' 
      ? [loginEmail, loginPassword]
      : [signupName, signupEmail, signupPassword, signupConfirmPassword];
    
    const totalInputs = inputs.length;
    let progress = 0;
    
    inputs.forEach(input => {
      if (input.length > 0) {
        // Calculate progress based on input length
        const inputProgress = Math.min(input.length * 2, 100 / totalInputs);
        progress += inputProgress;
      }
    });

    // Ensure progress doesn't exceed 100%
    progress = Math.min(progress, 100);
    setTargetProgress(progress);
  };

  // Switch between forms
  const switchTab = (login: boolean) => {
    setIsLogin(login);
    
    // Reset progress
    setCurrentProgress(0);
    setTargetProgress(0);
    
    if (progressFillRef.current) {
      progressFillRef.current.style.width = '0%';
    }
    
    setLoginMsg({ text: '', type: '' });
    setSignupMsg({ text: '', type: '' });
  };

  // Handle login form submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMsg({ text: 'Logging in...', type: 'success' });
    setTargetProgress(100);
    
    try {
      await login(loginEmail, loginPassword);
      setLoginMsg({ text: 'Welcome to CleanTrack!', type: 'success' });
      
      // User will be automatically redirected by the useEffect above
    } catch (error) {
      console.error('Login error:', error);
      setLoginMsg({ 
        text: error instanceof Error ? error.message : 'Failed to login. Please try again.', 
        type: 'error' 
      });
      setTargetProgress(30); // Reduce progress to indicate error
    }
  };

  // Handle signup form submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== signupConfirmPassword) {
      setSignupMsg({ text: 'Passwords do not match!', type: 'error' });
      return;
    }
    
    setSignupMsg({ text: 'Creating account...', type: 'success' });
    setTargetProgress(100);
    
    try {
      const userData = {
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        role: 'staff' // Default role for new signups
      };
      
      await register(userData);
      setSignupMsg({ text: 'Account created successfully!', type: 'success' });
      
      // Switch to login after successful signup
      setTimeout(() => switchTab(true), 1500);
    } catch (error) {
      console.error('Signup error:', error);
      setSignupMsg({ 
        text: error instanceof Error ? error.message : 'Failed to create account. Please try again.', 
        type: 'error' 
      });
      setTargetProgress(50); // Reduce progress to indicate error
    }
  };

  return (
    <div className="auth-container">
      <div className="bubbles">
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>

      <div className="container">
        <div className="form-card" id="formCard">
          <div className="form-header">
            <svg viewBox="0 0 48 48">
              <path d="M38 12h-2V8c0-1.1-.9-2-2-2h-4V4c0-1.1-.9-2-2-2H20c-1.1 0-2 .9-2 2v2h-4c-1.1 0-2 .9-2 2v4h-2c-1.1 0-2 .9-2 2v28c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4V14c0-1.1-.9-2-2-2zM20 4h8v2h-8V4zm-6 4h20v4H14V8zm24 34c0 1.1-.9 2-2 2H12c-1.1 0-2-.9-2-2V14h28v28z"/>
            </svg>
            CleanTrack
          </div>

          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                ref={progressFillRef}
                style={{ width: `${currentProgress}%` }}
              >
                <div className="foam-bubbles">
                  <div className="foam"></div>
                  <div className="foam"></div>
                  <div className="foam"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="toggle-btns">
            <button 
              className={`toggle-btn ${isLogin ? 'active' : ''}`} 
              onClick={() => switchTab(true)}
            >
              Login
            </button>
            <button 
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => switchTab(false)}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          <form 
            style={{ display: isLogin ? 'block' : 'none' }}
            onSubmit={handleLoginSubmit}
          >
            <div className="input-group">
              <svg viewBox="0 0 24 24">
                <path d="M12 13.5l8-6V6H4v1.5l8 6zm0 2.5l-8-6V18h16V10l-8 6z"/>
              </svg>
              <input 
                type="email" 
                placeholder="Email" 
                required 
                className="progress-input"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  updateProgress('login');
                }}
              />
            </div>
            <div className="input-group">
              <svg viewBox="0 0 24 24">
                <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-7V7a6 6 0 0 0-12 0v3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-8-3a4 4 0 0 1 8 0v3H8V7zm10 13H6v-8h12z"/>
              </svg>
              <input 
                type="password" 
                placeholder="Password" 
                required 
                className="progress-input"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  updateProgress('login');
                }}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Login</button>
            </div>
            {loginMsg.text && (
              <div className={`message ${loginMsg.type}`}>
                {loginMsg.text}
              </div>
            )}
          </form>

          {/* Signup Form */}
          <form 
            style={{ display: !isLogin ? 'block' : 'none' }}
            onSubmit={handleSignupSubmit}
          >
            <div className="input-group">
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
              </svg>
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                className="progress-input"
                value={signupName}
                onChange={(e) => {
                  setSignupName(e.target.value);
                  updateProgress('signup');
                }}
              />
            </div>
            <div className="input-group">
              <svg viewBox="0 0 24 24">
                <path d="M12 13.5l8-6V6H4v1.5l8 6zm0 2.5l-8-6V18h16V10l-8 6z"/>
              </svg>
              <input 
                type="email" 
                placeholder="Email" 
                required 
                className="progress-input"
                value={signupEmail}
                onChange={(e) => {
                  setSignupEmail(e.target.value);
                  updateProgress('signup');
                }}
              />
            </div>
            <div className="input-group">
              <svg viewBox="0 0 24 24">
                <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-7V7a6 6 0 0 0-12 0v3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-8-3a4 4 0 0 1 8 0v3H8V7zm10 13H6v-8h12z"/>
              </svg>
              <input 
                type="password" 
                placeholder="Password" 
                required 
                className="progress-input"
                value={signupPassword}
                onChange={(e) => {
                  setSignupPassword(e.target.value);
                  updateProgress('signup');
                }}
              />
            </div>
            <div className="input-group">
              <svg viewBox="0 0 24 24">
                <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-7V7a6 6 0 0 0-12 0v3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-8-3a4 4 0 0 1 8 0v3H8V7zm10 13H6v-8h12z"/>
              </svg>
              <input 
                type="password" 
                placeholder="Confirm Password" 
                required 
                className="progress-input"
                value={signupConfirmPassword}
                onChange={(e) => {
                  setSignupConfirmPassword(e.target.value);
                  updateProgress('signup');
                }}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Sign Up</button>
            </div>
            {signupMsg.text && (
              <div className={`message ${signupMsg.type}`}>
                {signupMsg.text}
              </div>
            )}
          </form>

          <div className="form-footer">
            <span>
              {isLogin 
                ? "Don't have an account? " 
                : "Already have an account? "}
              <a onClick={() => switchTab(!isLogin)}>
                {isLogin ? "Sign Up" : "Login"}
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageLogin; 