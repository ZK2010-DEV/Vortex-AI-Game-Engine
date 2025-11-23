import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PerformanceData } from '../types';

interface ProfilerProps {
  active: boolean;
}

const Profiler: React.FC<ProfilerProps> = ({ active }) => {
  const [data, setData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    if (!active) return;

    // Mock performance data generation since we can't easily tap into the iframe's internal loop from here 
    // without injecting postMessage scripts. This simulates the dashboard aspect.
    const interval = setInterval(() => {
      setData(current => {
        const now = Date.now();
        const newPoint = {
          time: now,
          fps: 55 + Math.random() * 10, // Simulated stable 60fps
          memory: 120 + Math.random() * 20, // MB
        };
        const updated = [...current, newPoint];
        if (updated.length > 20) updated.shift();
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute bottom-4 right-4 w-64 h-32 bg-vortex-900/90 backdrop-blur border border-vortex-700 rounded p-2 shadow-lg z-10">
      <h4 className="text-[10px] text-gray-400 font-mono uppercase mb-1">Performance (Simulated)</h4>
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="fps" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
            <YAxis domain={[0, 70]} hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: '10px' }}
              itemStyle={{ color: '#10b981' }}
              labelStyle={{ display: 'none' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Profiler;