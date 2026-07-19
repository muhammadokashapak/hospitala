import { useState } from 'react';
import { User, Activity, Clock, CheckCircle2, XCircle, LogOut } from 'lucide-react';

export default function DoctorDashboard() {
  const [activeToken, setActiveToken] = useState(12);
  const [prescription, setPrescription] = useState('');

  // Mock Data
  const queue = [
    { id: 1, name: 'Ali Khan', age: 45, gender: 'Male', token: 12, status: 'In-Consultation', notes: 'Patient complains of chest pain.' },
    { id: 2, name: 'Sara Ahmed', age: 30, gender: 'Female', token: 13, status: 'Waiting', notes: '' },
    { id: 3, name: 'Zainab Bibi', age: 60, gender: 'Female', token: 14, status: 'Waiting', notes: '' }
  ];

  const currentPatient = queue.find(q => q.token === activeToken);

  const handleStatusChange = (status) => {
    console.log(`Setting status to ${status} for token ${activeToken}`);
    if (status === 'Completed') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white px-8 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Console</h1>
          <p className="text-gray-500 font-medium">Welcome, Dr. Usama (Cardiology)</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
            Attendance: Checked In
          </span>
          <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-bold transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </header>

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-140px)]">
          
          {/* Left Col: Queue View */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden lg:col-span-1">
            <div className="p-4 bg-gray-100 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock size={20} className="text-blue-600" /> My Queue
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {queue.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setActiveToken(item.token)}
                  className={`p-4 mb-2 rounded-lg cursor-pointer transition-colors border-2 ${
                    activeToken === item.token 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-transparent hover:bg-gray-50 border-b-gray-100'
                  } flex items-center gap-4`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${
                    activeToken === item.token ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}>
                    {item.token}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg leading-tight">{item.name}</div>
                    <div className={`text-sm font-bold mt-1 ${item.status === 'In-Consultation' ? 'text-blue-600' : 'text-gray-500'}`}>
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Consultation Area */}
          <div className="lg:col-span-3 flex flex-col gap-6 h-full">
            
            {currentPatient ? (
              <>
                {/* Patient Bio */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 shrink-0">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <User size={32} className="text-blue-600" /> {currentPatient.name}
                      </h2>
                      <p className="text-gray-600 text-lg mt-2 font-medium">
                        Age: {currentPatient.age} &nbsp;|&nbsp; Gender: {currentPatient.gender} &nbsp;|&nbsp; Token: <span className="text-blue-600 font-bold">#{currentPatient.token}</span>
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold border border-blue-200 text-lg">
                      In Consultation
                    </span>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="font-bold text-yellow-800 mb-1">Previous History:</p>
                    <p className="text-gray-800 text-lg">{currentPatient.notes || 'No previous history found.'}</p>
                  </div>
                </div>

                {/* Dynamic Prescription Block */}
                <div className="bg-white rounded-xl shadow-sm border border-blue-200 flex flex-col flex-1 overflow-hidden border-t-4 border-t-blue-600 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity size={24} className="text-blue-600" /> Clinical Notes & Prescription
                  </h3>
                  
                  <textarea 
                    className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg resize-none mb-6"
                    placeholder="Enter diagnostic notes, medicines, and dosages here. This will be printed on the slip."
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                  />

                  <div className="flex justify-between items-center shrink-0">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleStatusChange('No-Show')} 
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-3 px-6 rounded-lg font-bold transition-colors text-lg"
                      >
                        <XCircle size={20} /> Skip / No-Show
                      </button>
                      <button 
                        onClick={() => handleStatusChange('On-Hold')} 
                        className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 py-3 px-6 rounded-lg font-bold transition-colors text-lg"
                      >
                        <Clock size={20} /> Put on Hold
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleStatusChange('Completed')} 
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-bold shadow-md transition-colors text-xl"
                    >
                      <CheckCircle2 size={24} /> Complete & Print
                    </button>
                  </div>
                </div>

                {/* Hidden Print Area */}
                <div className="hidden print-only p-4 font-mono text-sm max-w-[80mm] mx-auto border-dashed border-2 border-gray-300">
                   <h2 className="text-center font-bold text-xl mb-2">DHLMS HOSPITAL</h2>
                   <p className="text-center font-bold mb-4">Prescription Slip</p>
                   <p><strong>Patient:</strong> {currentPatient.name} ({currentPatient.age}{currentPatient.gender[0]})</p>
                   <p className="mb-4"><strong>Doctor:</strong> Dr. Usama</p>
                   <hr className="border-t border-black mb-4"/>
                   <p className="whitespace-pre-wrap">{prescription || 'No notes.'}</p>
                   <hr className="border-t border-black mt-4 mb-2"/>
                   <p className="text-center text-xs">Generated by DHLMS</p>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center h-full text-gray-500 text-xl font-medium">
                Select a patient from the queue to start consultation.
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
