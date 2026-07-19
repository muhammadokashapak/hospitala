import { useState } from 'react';

export default function LiveQueue() {
  const [currentTokens, setCurrentTokens] = useState([
    { doctor: 'Dr. Usama (Cardiology)', room: '101', current: 12, next: 13 },
    { doctor: 'Dr. Ali (Cardiology)', room: '102', current: 5, next: 6 },
    { doctor: 'Dr. Zainab (Pediatrics)', room: '105', current: 20, next: 21 },
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      
      <header className="bg-gray-800 p-8 text-center border-b border-gray-700 shadow-lg">
        <h1 className="text-5xl font-black tracking-tight text-white mb-2">
          HOSPITAL <span className="text-blue-500">OPD QUEUE</span>
        </h1>
        <p className="text-gray-400 text-2xl font-medium">Please wait for your token number</p>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[1800px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {currentTokens.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-2xl border border-gray-700 p-10 text-center shadow-2xl flex flex-col h-full">
              
              <h2 className="text-4xl font-bold text-white mb-4 line-clamp-2 min-h-[96px]">{item.doctor}</h2>
              
              <div className="inline-block mx-auto bg-gray-700 text-gray-200 px-6 py-2 rounded-full font-bold text-xl mb-10 border border-gray-600">
                Room: {item.room}
              </div>
              
              <div className="flex-1 flex flex-col justify-center mb-10">
                <p className="text-gray-400 text-2xl uppercase tracking-widest font-bold mb-4">Current Token</p>
                <div className="text-[10rem] font-black leading-none text-blue-500 drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]">
                  {item.current}
                </div>
              </div>

              <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                <p className="text-gray-400 text-2xl font-medium">
                  Next Up: <span className="text-white font-black ml-2">{item.next}</span>
                </p>
              </div>

            </div>
          ))}

        </div>
      </main>
      
      <footer className="bg-gray-900 p-6 text-center text-gray-500 text-xl font-medium border-t border-gray-800">
        DHLMS Live Offline Server
      </footer>
    </div>
  );
}
