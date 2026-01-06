import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TimeSeriesChartProps {
  data: any[];
  dataKey: string;
  color?: string;
  title?: string;
  unit?: string;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  data, 
  dataKey, 
  color = "#3b82f6", // Default blue modern
  title,
  unit 
}) => {
  return (
    <div className="w-full h-full p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      {title && (
        <h3 className="text-gray-600 font-semibold mb-4 text-sm uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9ca3af" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(str) => {
                try {
                  const date = new Date(str);
                  if (isNaN(date.getTime())) return str; // Fallback jika invalid date
                  return `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
                } catch (e) {
                  return str;
                }
              }}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              unit={unit}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
              // PERBAIKAN DI SINI: Menggunakan tipe 'any' untuk value agar kompatibel dengan Recharts
              formatter={(value: any) => [
                `${value !== undefined && value !== null ? value : '-'} ${unit || ''}`, 
                dataKey
              ]}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#color${dataKey})`}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimeSeriesChart;