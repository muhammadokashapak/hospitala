import { useState, useEffect } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState({ full_name: '', email: '', role: '', gender: '' });
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/profile/', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setProfile(data);
      // Update local storage name if it changed
      if (data.full_name) localStorage.setItem('name', data.full_name);
    })
    .catch(err => console.error(err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch('http://localhost:8000/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          password: password || undefined
        })
      });
      if (res.ok) {
        setStatus('Profile saved successfully!');
        localStorage.setItem('name', profile.full_name);
        setPassword('');
      } else {
        setStatus('Failed to save profile.');
      }
    } catch (err) {
      setStatus('Error saving profile.');
    }
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h2>
        
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email (Read Only)</label>
              <input 
                type="text" 
                value={profile.email} 
                disabled 
                className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role (Read Only)</label>
              <input 
                type="text" 
                value={profile.role} 
                disabled 
                className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {profile.rotation_group_name && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Batch Category (Read Only)</label>
              <input 
                type="text" 
                value={profile.rotation_group_name} 
                disabled 
                className="w-full bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 text-indigo-700 font-semibold cursor-not-allowed"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={profile.full_name} 
              onChange={e => setProfile({...profile, full_name: e.target.value})}
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password (Optional)</label>
            <input 
              type="password" 
              placeholder="Leave blank to keep current password"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button 
              type="submit" 
              className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Save Changes
            </button>
            {status && (
              <span className={`text-sm font-medium ${status.includes('success') ? 'text-green-600' : 'text-slate-500'}`}>
                {status}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
