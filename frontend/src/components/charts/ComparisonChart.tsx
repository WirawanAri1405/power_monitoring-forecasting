import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComparisonChartProps {
    data: Array<{
        timestamp: string;
        actual: number;
        predicted: number;
    }>;
    unit: string;
    title: string;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ data, unit, title }) => {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {new Date(payload[0].payload.timestamp).toLocaleDateString('id-ID', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
                            {entry.name}: {entry.value.toFixed(2)} {unit}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-700"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatTime}
                        stroke="currentColor"
                        className="text-slate-500 dark:text-slate-400"
                        style={{ fontSize: '11px' }}
                        tick={{ fill: 'currentColor' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="currentColor"
                        className="text-slate-500 dark:text-slate-400"
                        style={{ fontSize: '11px' }}
                        tick={{ fill: 'currentColor' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                        formatter={(value) => <span className="text-slate-700 dark:text-slate-300">{value}</span>}
                    />
                    <Line
                        type="monotone"
                        dataKey="actual"
                        name="Actual"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="predicted"
                        name="Predicted"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ComparisonChart;
