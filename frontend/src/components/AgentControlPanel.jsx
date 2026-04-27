import React, { useState } from 'react';

export default function AgentControlPanel() {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const startTeeStream = () => {
    setIsRunning(true);
    setLogs([]); // Clear old logs
    
    // Connect to the Server-Sent Events endpoint
    // Add fallback to prevent demo failures if VITE_API_URL is not set
    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/agent/stream-tee`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs((prevLogs) => [...prevLogs, data]);
      
      // Stop listening when complete
      if (data.status === 'complete' || data.status === 'error') {
        eventSource.close();
        setIsRunning(false);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Stream failed", error);
      eventSource.close();
      setIsRunning(false);
    };
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-lg border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🤖 0G Compute TEE Console</h2>
      </div>

      <button
        onClick={startTeeStream}
        disabled={isRunning}
        className={`w-full py-3 px-4 rounded font-bold mb-6 transition-all ${
          isRunning 
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
        }`}
      >
        {isRunning ? 'Enclave Active...' : 'Execute Verifiable AI Strategy'}
      </button>

      {/* The Live Terminal Window */}
      <div className="bg-black p-4 rounded border border-gray-700 font-mono text-sm h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <span className="text-gray-600">Awaiting execution command...</span>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="mb-2 animate-fade-in">
              <span className="text-gray-500">[{log.time}]</span>{' '}
              <span className={
                log.status === 'processing' ? 'text-yellow-400' :
                log.status === 'success' || log.status === 'complete' ? 'text-green-400' :
                log.status === 'error' ? 'text-red-500' :
                'text-blue-400'
              }>
                {log.status === 'processing' ? '>> ' : log.status === 'complete' ? '✓ ' : 'ℹ '}
                {log.message}
              </span>
            </div>
          ))
        )}
        {isRunning && (
          <div className="text-blue-400 animate-pulse mt-2">_</div>
        )}
      </div>
    </div>
  );
}
