import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name') || 'User';
    
    if (!token) {
      navigate('/login');
    } else {
      setUser({ role, name });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">DHM ERP</h1>
            <p className="text-xs text-slate-500 font-medium">Offline-First Hospital Network</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700">{user.name}</p>
            <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-full mt-1">
              {user.role}
            </p>
          </div>
          
          <div className="h-8 w-px bg-slate-200"></div>
          
          <Link to="/profile" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            Profile
          </Link>
          
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
