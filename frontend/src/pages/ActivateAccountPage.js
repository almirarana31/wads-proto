import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

const ActivateAccountPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Activating your account...');
  const navigate = useNavigate();
  const hasActivated = useRef(false);

  useEffect(() => {
    if (hasActivated.current) return;
    hasActivated.current = true;
    const activate = async () => {
      try {
        const res = await authService.activate(token);
        setStatus('success');
        setMessage(res.message || 'Account activated successfully!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setStatus('error');
        setMessage(
          err.response?.data?.message || 'Activation failed. The link may be invalid or expired.'
        );
      }
    };
    activate();
  }, [token, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Account Activation</h1>
        <p className={status === 'success' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-gray-700'}>
          {message}
        </p>
        {status === 'success' && (
          <p className="mt-4 text-sm text-gray-500">Redirecting to login...</p>
        )}
      </div>
    </div>
  );
};

export default ActivateAccountPage;
