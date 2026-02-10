import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const LoginModal: React.FC<Props> = ({ open, onClose, onSwitchToSignup }) => {
  const { loginUser } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    const err = await loginUser(email, password);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <section className="modal">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Welcome Back</h3>
          <button className="icon-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <label>
            <span>Email Address</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </label>
          <button className="primary-button full-width" onClick={handleSubmit}>
            LOG IN
          </button>
          <p className="modal-switch">
            Don't have an account?{' '}
            <button className="link-button" onClick={onSwitchToSignup}>
              Create an Account
            </button>
          </p>
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </section>
  );
};

export default LoginModal;
