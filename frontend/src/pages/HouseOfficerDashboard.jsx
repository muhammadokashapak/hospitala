import { useState, useEffect } from 'react';

export default function HouseOfficerDashboard() {
  const [profile, setProfile] = useState(null);
  
  // Tasks states
  const [tasks, setTasks] = useState([]);
  const [taskMsg, setTaskMsg] = useState('');
  
  // Leaves states
  const [leaveDate, setLeaveDate] = useState('');
  const [reason, setReason] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [leaveMsg, setLeaveMsg] = useState('');
  
  // Logbook states
  const [procedureName, setProcedureName] = useState('');
  const [logbooks, setLogbooks] = useState([]);
  const [logbookMsg, setLogbookMsg] = useState('');

  const fetchProfile = () => {
    fetch('http://localhost:8000/profile/', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setProfile(data))
    .catch(err => console.error(err));
  };

  const fetchTasks = () => {
    fetch('http://localhost:8000/tasks/my_tasks', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setTasks(data))
    .catch(err => console.error(err));
  };

  const fetchRequests = () => {
    fetch('http://localhost:8000/leave_requests/my_requests', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setMyRequests(data))
    .catch(err => console.error(err));
  };

  const fetchLogbooks = () => {
    fetch('http://localhost:8000/tasks/logbook/my_entries', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setLogbooks(data))
    .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProfile();
    fetchTasks();
    fetchRequests();
    fetchLogbooks();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setLeaveMsg('Submitting...');
    try {
      const res = await fetch('http://localhost:8000/leave_requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ leave_date: leaveDate, reason })
      });
      if (res.ok) {
        setLeaveMsg('Leave request submitted to TMO!');
        setLeaveDate('');
        setReason('');
        fetchRequests();
      } else {
        const errData = await res.json();
        setLeaveMsg(errData.detail || 'Failed to submit request.');
      }
    } catch (err) {
      setLeaveMsg('Server error.');
    }
  };

  const handleUpdateTaskStatus = async (taskId, currentStatus) => {
    const statusOrder = ['Pending', 'In_Progress', 'Completed'];
    const nextIndex = (statusOrder.indexOf(currentStatus) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];
    
    try {
      const res = await fetch(`http://localhost:8000/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchTasks();
      } else {
        setTaskMsg('Failed to update task.');
      }
    } catch (err) {
      setTaskMsg('Server error.');
    }
  };

  const handleSubmitLogbook = async (e) => {
    e.preventDefault();
    // In our test seeder, Surgery Track TMO has ID 1 (tmo_profile.id == 1)
    // We will target TMO ID 1 as default for test rotation
    setLogbookMsg('Submitting log...');
    try {
      const res = await fetch('http://localhost:8000/tasks/logbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          procedure_name: procedureName,
          tmo_id: 1 // Link to supervisor TMO ID 1
        })
      });
      if (res.ok) {
        setLogbookMsg('Procedure logged successfully!');
        setProcedureName('');
        fetchLogbooks();
      } else {
        const errData = await res.json();
        setLogbookMsg(errData.detail || 'Failed to log procedure.');
      }
    } catch (err) {
      setLogbookMsg('Server error.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">House Officer Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Check tasks, logs, shifts, and leaves allocated to your batch.</p>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">Active Rotation</span>
            <p className="text-2xl font-black text-slate-800 mt-3">3-Month Block</p>
            <p className="text-xs text-slate-500 mt-1">Surgery / Medicine Allied departments</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase">Allied Department</span>
            <p className="text-2xl font-black text-slate-800 mt-3">General Surgery</p>
            <p className="text-xs text-slate-500 mt-1">Assigned block rotation target</p>
          </div>
        </div>

        {/* TMO Tasks Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-2">TMO Tasks Feed</h2>
          <p className="text-xs text-slate-500 mb-4">Click on any task tag to cycle status (Pending ➜ In Progress ➜ Completed).</p>
          {taskMsg && <p className="text-sm text-indigo-600 mb-3">{taskMsg}</p>}
          {tasks.length === 0 ? (
            <p className="text-slate-500 text-sm">No tasks assigned by your TMO yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map(t => (
                <div key={t.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{t.task_title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{t.task_description}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">Assigned by TMO: {t.tmo_name}</span>
                  </div>
                  <button 
                    onClick={() => handleUpdateTaskStatus(t.id, t.status)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                      t.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                      t.status === 'In_Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {t.status}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Leaves Application Module */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Leave Application</h2>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Date</label>
                <input 
                  type="date"
                  value={leaveDate}
                  onChange={e => setLeaveDate(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea 
                  rows="2"
                  placeholder="Explain your absence..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg"
              >
                Apply Leave
              </button>
              {leaveMsg && <p className="text-xs text-indigo-600 text-center font-bold">{leaveMsg}</p>}
            </form>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">My Applications</h3>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                {myRequests.map(r => (
                  <div key={r.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">{r.leave_date}</p>
                      <p className="text-slate-500 italic">"{r.reason}"</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      r.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      r.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Procedure Logbooks Module */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Logbook Submission</h2>
            <form onSubmit={handleSubmitLogbook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Performed Procedure Name</label>
                <input 
                  type="text"
                  placeholder="e.g., Appendectomy Assist"
                  value={procedureName}
                  onChange={e => setProcedureName(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg"
              >
                Log Procedure
              </button>
              {logbookMsg && <p className="text-xs text-indigo-600 text-center font-bold">{logbookMsg}</p>}
            </form>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Logged Procedures</h3>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                {logbooks.map(e => (
                  <div key={e.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">{e.procedure_name}</p>
                      <p className="text-slate-400">Date: {e.date_performed}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      e.supervisor_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>{e.supervisor_approved ? 'Approved' : 'Pending'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
