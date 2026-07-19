import { useState } from 'react';
import { Search, Printer, UserPlus, FileText } from 'lucide-react';

export default function ReceptionistDashboard() {
  const [searchPhone, setSearchPhone] = useState('');
  
  // Mock Data
  const queue = [
    { id: 1, name: 'Ali Khan', doctor: 'Dr. Usama (Cardiology)', token: 12, status: 'Waiting' },
    { id: 2, name: 'Sara Ahmed', doctor: 'Dr. Usama (Cardiology)', token: 13, status: 'Waiting' }
  ];

  const handlePrint = (token) => {
    // Esc/POS Raw Print Logic or window.print for specific div
    console.log("Sending RAW ESC/POS to thermal printer for token:", token);
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reception Desk</h1>
            <p className="text-gray-500 mt-1 text-lg">Patient Registration & Token Management</p>
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold border border-green-200 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            Server Online (Local)
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Registration & Search */}
          <div className="flex flex-col gap-8 lg:col-span-1">
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Search className="text-blue-600" /> Fast Search
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="0300-XXXXXXX"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                />
              </div>
              <button className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg border border-gray-300 transition-colors text-lg">
                Lookup Patient
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 border-t-4 border-t-blue-600">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UserPlus className="text-blue-600" /> New Registration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg" />
                </div>
                
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Age</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg" />
                  </div>
                  <div className="w-2/3">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-lg">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg" />
                </div>

                <div className="pt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Assign Doctor</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-lg font-bold mb-4">
                    <option>Dr. Usama (Cardiology)</option>
                    <option>Dr. Zainab (Pediatrics)</option>
                  </select>
                  
                  <button className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition-colors text-xl flex items-center justify-center gap-2">
                    <FileText size={24} /> Generate Token
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Col: Active Tokens */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Active Tokens</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="py-4 px-4 font-bold text-gray-600 uppercase text-sm tracking-wider">Token</th>
                    <th className="py-4 px-4 font-bold text-gray-600 uppercase text-sm tracking-wider">Patient Name</th>
                    <th className="py-4 px-4 font-bold text-gray-600 uppercase text-sm tracking-wider">Assigned Doctor</th>
                    <th className="py-4 px-4 font-bold text-gray-600 uppercase text-sm tracking-wider">Status</th>
                    <th className="py-4 px-4 font-bold text-gray-600 uppercase text-sm tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {queue.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-800 rounded-full font-bold text-xl border border-blue-200">
                          {item.token}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900 text-lg">{item.name}</td>
                      <td className="py-4 px-4 text-gray-600 text-lg">{item.doctor}</td>
                      <td className="py-4 px-4">
                        <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-sm font-bold border border-yellow-200">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handlePrint(item.token)} 
                          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg font-bold transition-colors"
                        >
                          <Printer size={18} /> Print Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                  {queue.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500 text-lg">No active tokens in queue.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Hidden Print Layout Template (for thermal printer layout) */}
            <div className="hidden print-only p-4 font-mono text-sm max-w-[80mm] mx-auto border-dashed border-2 border-gray-300">
               <h2 className="text-center font-bold text-xl mb-2">DHLMS HOSPITAL</h2>
               <p className="text-center mb-4">Token Slip</p>
               <hr className="border-t border-black mb-4"/>
               <div className="text-center mb-4">
                  <p className="text-xs">Token Number</p>
                  <p className="text-6xl font-bold">12</p>
               </div>
               <p className="mb-2"><strong>Patient:</strong> Ali Khan</p>
               <p className="mb-4"><strong>Doctor:</strong> Dr. Usama (Cardiology)</p>
               <p className="text-center text-xs">Please wait for your turn. Thank you.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
