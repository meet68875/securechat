'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../../store/hooks';
import { loginSuccess } from '../../../../store/slices/authSlice';
import { apiClient } from '../../../../lib/apiClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const res = await apiClient('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      // Check for HTTP status code errors
      const data = await res.json();
      setError(data.error || 'Invalid credentials'); // Use the error message from the server
      return; // Exit if the response isn't OK
    }

    const data = await res.json();
    if (data.success) {
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      router.push('/chat');
    } else {
      setError(data.error || 'Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-indigo-100 rounded-full">
            <i className="pi pi-lock text-2xl text-indigo-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Welcome Back</h1>
          <p className="text-gray-600 mt-1 text-sm">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email or Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com or username"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg 
                         shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg 
                         shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg 
                       font-semibold hover:bg-indigo-700 transition duration-200 
                       disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-indigo-600 font-medium hover:underline">
              Sign Up
            </a>
          </p>

         
        </div>
      </div>
    </div>
  );
}
