import { useState } from 'react';
import { CalendarDays, Settings, Play, CheckCircle2 } from 'lucide-react';

export default function ShiftPlanner() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);

  // Mock data for HOs
  const houseOfficers = [
    { id: 1, name: 'Dr. Ali', gender: 'Male', points: 28.0 },
    { id: 2, name: 'Dr. Bilal', gender: 'Male', points: 29.2 },
    { id: 3, name: 'Dr. Sara', gender: 'Female', points: 28.4 },
    { id: 4, name: 'Dr. Zainab', gender: 'Female', points: 28.0 },
  ];

  // Helper to mock shifts visually (M=Morning, E=Evening, N=Night, O=Off)
  // Generating a 14 day view for brevity
  const generateMockShifts = (gender) => {
    const shifts = [];
    let lastNight = -2;
    for (let i = 0; i < 14; i++) {
      if (gender === 'Female') {
        // Females get lots of Days/Evenings to match points
        shifts.push(Math.random() > 0.5 ? 'M' : 'E');
      } else {
        // Males do nights and get post-night off
        if (i === lastNight + 1) {
          shifts.push('O');
        } else if (Math.random() > 0.8) {
          shifts.push('N');
          lastNight = i;
        } else if (Math.random() > 0.5) {
          shifts.push('M');
        } else {
          shifts.push('E');
        }
      }
    }
    return shifts;
  };

  const shiftColors = {
    'M': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'E': 'bg-orange-100 text-orange-800 border-orange-200',
    'N': 'bg-blue-800 text-white border-blue-900',
    'O': 'bg-gray-100 text-gray-500 border-gray-200'
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setScheduleGenerated(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarDays className="text-blue-600" size={32} />
              HO Shift Planner
            </h1>
            <p className="text-gray-500 mt-1 text-lg">Smart Gender-Equitable Shift Distribution</p>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 py-3 px-6 rounded-lg font-bold shadow-md transition-all text-lg ${
              isGenerating ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isGenerating ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            ) : scheduleGenerated ? (
              <CheckCircle2 size={24} />
            ) : (
              <Play size={24} />
            )}
            {isGenerating ? 'Running Algorithm...' : scheduleGenerated ? 'Regenerate Block' : 'Run Scheduler Algorithm'}
          </button>
        </header>

        {scheduleGenerated ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Visual Shift Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 lg:col-span-3 overflow-hidden">
              <div className="p-4 bg-gray-800 text-white border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">Upcoming 14-Day Shift View</h2>
                <div className="flex gap-4 text-sm font-medium">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 border border-yellow-200 inline-block"></span> M = Morning</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-100 border border-orange-200 inline-block"></span> E = Evening</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-800 border border-blue-900 inline-block"></span> N = Night</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 border border-gray-200 inline-block"></span> O = Off</span>
                </div>
              </div>

              <div className="overflow-x-auto p-4">
                <table className="min-w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-left border-b-2 border-gray-200 font-bold text-gray-600 w-48">Officer</th>
                      {[...Array(14)].map((_, i) => (
                        <th key={i} className="py-2 px-2 border-b-2 border-gray-200 text-gray-500 font-bold">Day {i+1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {houseOfficers.map((ho) => (
                      <tr key={ho.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-left font-bold text-gray-800">
                          {ho.name}
                          <div className="text-xs text-gray-500 font-normal">{ho.gender}</div>
                        </td>
                        {generateMockShifts(ho.gender).map((shift, i) => (
                          <td key={i} className="py-2 px-1">
                            <div className={`w-10 h-10 mx-auto rounded flex items-center justify-center font-bold border ${shiftColors[shift]}`}>
                              {shift}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* End of Month Points Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 border-t-4 border-t-blue-600 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="text-blue-600" />
                Algorithm Audit
              </h2>
              
              <div className="flex-1 space-y-4">
                {houseOfficers.map(ho => (
                  <div key={ho.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-800">{ho.name}</div>
                      <div className="text-xs text-gray-500">{ho.gender}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-blue-600">{ho.points.toFixed(1)}</div>
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Points</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 font-bold flex items-center gap-2">
                  <CheckCircle2 size={18} /> Points variance is &lt; 5%. The schedule is fully equitable.
                </p>
              </div>

            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-gray-200 shadow-sm">
            <CalendarDays size={64} className="text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-600">No Schedule Generated</h2>
            <p className="text-gray-500 mt-2">Click the button above to run the AI scheduler algorithm.</p>
          </div>
        )}

      </div>
    </div>
  );
}
