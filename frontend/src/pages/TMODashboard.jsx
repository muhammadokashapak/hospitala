import { useState, useEffect } from 'react';

export default function TMODashboard() {
  const [profile, setProfile] = useState(null);
  const [hos, setHos] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [logbookInbox, setLogbookInbox] = useState([]);
  
  // Roster parameters
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState(30);
  const [rosterMsg, setRosterMsg] = useState('');
  
  // Task parameters
  const [selectedHo, setSelectedHo] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskMsg, setTaskMsg] = useState('');
  
  const [inboxMsg, setInboxMsg] = useState('');

  const fetchProfile = () => {
    fetch('http://localhost:8000/profile/', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setProfile(data))
    .catch(err => console.error(err));
  };

  const fetchGroupHOs = () => {
    fetch('http://localhost:8000/tasks/group_hos', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setHos(data);
      if (data.length > 0) setSelectedHo(data[0].id);
    })
    .catch(err => console.error(err));
  };

  const fetchInbox = () => {
    fetch('http://localhost:8000/leave_requests/inbox', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setInbox(data))
    .catch(err => console.error(err));
  };

  const fetchLogbook = () => {
    fetch('http://localhost:8000/tasks/logbook/inbox', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setLogbookInbox(data))
    .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProfile();
    fetchGroupHOs();
    fetchInbox();
    fetchLogbook();
  }, []);

  const handleGenerateShifts = async (e) => {
    e.preventDefault();
    if (!profile?.rotation_group_id) {
      setRosterMsg('Error: You are not assigned to any rotation group batch.');
      return;
    }
    setRosterMsg('Generating roster...');
    try {
      const res = await fetch(`http://localhost:8000/scheduler/generate_shifts?rotation_group_id=${profile.rotation_group_id}&start_date=${startDate}&days=${days}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setRosterMsg('Successfully generated and published shift roster!');
      } else {
        const errData = await res.json();
        setRosterMsg(errData.detail || 'Failed to generate schedule.');
      }
    } catch (err) {
      setRosterMsg('Server connection error.');
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!selectedHo) {
      setTaskMsg('Error: Please select a House Officer.');
      return;
    }
    setTaskMsg('Assigning...');
    try {
      const res = await fetch('http://localhost:8000/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ho_id: parseInt(selectedHo),
          task_title: taskTitle,
          task_description: taskDesc
        })
      });
      if (res.ok) {
        setTaskMsg('Task assigned successfully!');
        setTaskTitle('');
        setTaskDesc('');
      } else {
        const errData = await res.json();
        setTaskMsg(errData.detail || 'Failed to assign task.');
      }
    } catch (err) {
      setTaskMsg('Server connection error.');
    }
  };

  const handleLeaveAction = async (id, status, comment = "") => {
    try {
      const res = await fetch(`http://localhost:8000/leave_requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, tmo_comment: comment })
      });
      if (res.ok) {
        setInboxMsg(`Request status updated to ${status}!`);
        fetchInbox();
      } else {
        setInboxMsg('Failed to update status.');
      }
    } catch (err) {
      setInboxMsg('Server error updating request.');
    }
    setTimeout(() => setInboxMsg(''), 3000);
  };

  const handleApproveLogbook = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/tasks/logbook/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setInboxMsg('Procedure log approved successfully!');
        fetchLogbook();
      } else {
        setInboxMsg('Failed to approve procedure.');
      }
    } catch (err) {
      setInboxMsg('Server error.');
    }
    setTimeout(() => setInboxMsg(''), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">TMO Officer Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Supervision Hub & schedule roster controller for your active rotation track.</p>
          {profile?.rotation_group_name && (
            <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
              Category: {profile.rotation_group_name}
            </span>
          )}
        </div>

        {/* Dynamic Directory Column */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Track HO Directory</h2>
          <p className="text-xs text-slate-500 mb-4">All House Officers registered in your Specialty / Rotation Group Batch.</p>
          {hos.length === 0 ? (
            <p className="text-sm text-slate-500">No House Officers found in your track.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {hos.map(h => (
                <div key={h.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                  <p className="text-sm font-bold text-slate-800">{h.full_name}</p>
                  <p className="text-xs text-slate-500">{h.email}</p>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/50">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">{h.gender}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Batch Year: {h.batch_year}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shift Scheduler Controller */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Roster Generator</h2>
            <form onSubmit={handleGenerateShifts} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Roster Start Date</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Days)</label>
                <select 
                  value={days}
                  onChange={e => setDays(parseInt(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={7}>7 Days</option>
                  <option value={15}>15 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Generate & Publish Shifts
              </button>

              {rosterMsg && (
                <p className="text-sm text-indigo-600 font-medium text-center mt-2">{rosterMsg}</p>
              )}
            </form>
          </div>

          {/* Task Assigner Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Assign Clinical Task</h2>
            <form onSubmit={handleAssignTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select House Officer</label>
                <select 
                  value={selectedHo}
                  onChange={e => setSelectedHo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {hos.map(h => (
                    <option key={h.id} value={h.id}>{h.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                <input 
                  type="text"
                  placeholder="e.g., Pre-Op preparation for Bed 4"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  rows="2"
                  placeholder="Additional vital check instructions..."
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Assign Task
              </button>

              {taskMsg && (
                <p className="text-sm text-indigo-600 font-medium text-center mt-2">{taskMsg}</p>
              )}
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Leaves Inbox */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Leave Requests</h2>
            {inbox.length === 0 ? (
              <p className="text-slate-500 text-sm">No leave requests in your inbox.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-2">
                {inbox.map((req) => (
                  <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{req.ho_name} ({req.leave_date})</p>
                      <p className="text-xs text-slate-500 italic mt-0.5">"{req.reason}"</p>
                    </div>
                    {req.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleLeaveAction(req.id, 'Approved', 'Approved')}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-2 py-1 rounded shadow"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleLeaveAction(req.id, 'Rejected', 'Rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2 py-1 rounded shadow"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">{req.status}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Surgical/Procedure Logbooks Inbox */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Logbook Approvals Inbox</h2>
            {logbookInbox.length === 0 ? (
              <p className="text-slate-500 text-sm">No logbook entries awaiting approval.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-2">
                {logbookInbox.map((entry) => (
                  <div key={entry.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{entry.procedure_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Performed Date: {entry.date_performed}</p>
                    </div>
                    {!entry.supervisor_approved ? (
                      <button 
                        onClick={() => handleApproveLogbook(entry.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">Approved</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
