import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  unit?: string;
  color?: string;
}

const RADIAN = Math.PI / 180;

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  title,
  unit,
  color = "#8884d8",
}) => {
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  
  const data = [
    { name: 'value', value: percentage, color: color },
    { name: 'rest', value: 100 - percentage, color: '#e5e7eb' },
  ];

  // Logika Jarum
  // Kita gunakan sistem koordinat 0-100 untuk viewBox
  const cx = 50; 
  const cy = 70; 
  const iR = 50; 
  const oR = 100; 
  const ang = 180 - (percentage * 1.8); 

  const needleLength = 45; // Panjang jarum (skala 0-100)
  const needleRadius = 4;  // Lebar pangkal jarum

  const x0 = cx + needleRadius * Math.cos(-RADIAN * (ang - 90));
  const y0 = cy + needleRadius * Math.sin(-RADIAN * (ang - 90));
  const x1 = cx + needleRadius * Math.cos(-RADIAN * (ang + 90));
  const y1 = cy + needleRadius * Math.sin(-RADIAN * (ang + 90));
  const x2 = cx + needleLength * Math.cos(-RADIAN * ang);
  const y2 = cy + needleLength * Math.sin(-RADIAN * ang);

  return (
    <div className="w-full h-full p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
       {title && (
        <h3 className="text-gray-600 font-semibold mb-2 text-sm uppercase tracking-wider z-10">
          {title}
        </h3>
      )}
      
      {/* Container Chart */}
      <div style={{ width: '100%', height: 200, position: 'relative' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              dataKey="value"
              startAngle={180}
              endAngle={0}
              data={data}
              cx="50%"
              cy="70%"
              innerRadius="60%"
              outerRadius="100%"
              cornerRadius={5}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Teks Nilai */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="text-3xl font-bold text-gray-800">{value}</span>
            <span className="text-sm text-gray-500 ml-1">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;