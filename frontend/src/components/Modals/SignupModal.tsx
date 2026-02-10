import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignupModal: React.FC<Props> = ({ open, onClose, onSwitchToLogin }) => {
  const { signupUser } = useAuthContext();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError('Email and password required.');
      return;
    }
    const err = await signupUser(firstName, lastName, email, password);
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
          <h3>Create an Account</h3>
          <button className="icon-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <label>
            <span>Last Name</span>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Enter your last name"
            />
          </label>
          <label>
            <span>First Name</span>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Enter your first name"
            />
          </label>
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
            CREATE ACCOUNT
          </button>
          <p className="modal-switch">
            Already have an account?{' '}
            <button className="link-button" onClick={onSwitchToLogin}>
              Log In
            </button>
          </p>
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </section>
  );
};

export default SignupModal;
