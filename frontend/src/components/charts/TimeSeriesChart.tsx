import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimeSeriesChartProps {
    data: Array<{ timestamp: string;[key: string]: any }>;
    dataKey: string;
    color: string;
    label: string;
    unit: string;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
    data,
    dataKey,
    color,
    label,
    unit
}) => {
    // Format timestamp for display with date
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Today - show time only
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            // This week - show month and day
            return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
        } else {
            // Older - show date
            return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
        }
    };

    // Custom tooltip with dark mode support
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {new Date(payload[0].payload.timestamp).toLocaleDateString('id-ID', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {payload[0].value.toFixed(2)} {unit}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Create gradient ID based on color
    const gradientId = `gradient-${dataKey}`;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 lowercase first-letter:uppercase">{label}</h3>
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
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
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2.5}
                        fill={`url(#${gradientId})`}
                        activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: '#fff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TimeSeriesChart;
