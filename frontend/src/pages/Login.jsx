import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, User, KeyRound } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // 1. Authenticate and get JWT token
      const details = {
        'username': email.toLowerCase(),
        'password': password
      };

      const formBody = Object.keys(details)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key]))
        .join('&');

      const authRes = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
      });

      if (!authRes.ok) {
        throw new Error('Incorrect email or password');
      }

      const { access_token } = await authRes.json();
      localStorage.setItem('token', access_token);

      // 2. Fetch User Profile to get Name & Role for dashboard routing
      const profileRes = await fetch('http://localhost:8000/profile/', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      if (!profileRes.ok) {
        throw new Error('Failed to load user profile');
      }

      const profile = await profileRes.json();
      localStorage.setItem('role', profile.role);
      localStorage.setItem('name', profile.full_name);

      // 3. Route to dedicated dashboard
      const role = profile.role;
      if (role === 'Admin') navigate('/admin');
      else if (role === 'Receptionist') navigate('/reception');
      else if (role === 'Doctor') navigate('/doctor');
      else if (role === 'TMO') navigate('/tmo');
      else if (role === 'House Officer') navigate('/ho');
      else if (role === 'Pharmacist') navigate('/pharmacist');
      else if (role === 'Lab_Tech') navigate('/lab');
      else if (role === 'Nurse') navigate('/nurse');
      else if (role === 'Billing') navigate('/billing');
      else navigate('/queue');

    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-full mb-4">
            <Hospital size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DHLMS</h1>
          <p className="text-gray-500 text-sm mt-1">Digital Hospital Local Management System</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-center text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                autoFocus
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg" 
                placeholder="staff@hospital.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}
