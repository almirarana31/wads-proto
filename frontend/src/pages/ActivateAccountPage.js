import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const ActivateAccountPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Activating your account...');
  const navigate = useNavigate();

  useEffect(() => {
    const activate = async () => {
      try {
        const res = await axios.get(`/api/user/activate/${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Account activated successfully!');
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
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
