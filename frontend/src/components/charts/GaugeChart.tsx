import React from 'react';

interface GaugeChartProps {
    value: number;
    min: number;
    max: number;
    unit: string;
    label: string;
    thresholds?: Array<{ max: number; color: string; label: string }>;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
    value,
    min,
    max,
    unit,
    label,
    thresholds
}) => {
    // Default thresholds if not provided
    const defaultThresholds = thresholds || [
        { max: (max - min) * 0.7 + min, color: '#10b981', label: 'Normal' },
        { max: (max - min) * 0.9 + min, color: '#f59e0b', label: 'Warning' },
        { max: max, color: '#ef4444', label: 'Critical' }
    ];

    // Determine current color based on value
    const getCurrentColor = () => {
        for (const threshold of defaultThresholds) {
            if (value <= threshold.max) {
                return threshold.color;
            }
        }
        return defaultThresholds[defaultThresholds.length - 1].color;
    };

    const getCurrentStatus = () => {
        for (const threshold of defaultThresholds) {
            if (value <= threshold.max) {
                return threshold.label;
            }
        }
        return defaultThresholds[defaultThresholds.length - 1].label;
    };

    const color = getCurrentColor();
    const status = getCurrentStatus();
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4 text-center uppercase tracking-wide">
                {label}
            </h3>

            {/* Circular Progress */}
            <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                    {/* Background circle */}
                    <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-slate-100 dark:text-slate-800"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={color}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                        className="transition-all duration-500 ease-out"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Center value */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {value.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {unit}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status and Range */}
            <div className="text-center space-y-2">
                <div
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                        backgroundColor: `${color}20`,
                        color: color
                    }}
                >
                    {status}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    Range: {min} - {max} {unit}
                </div>
            </div>
        </div>
    );
};

export default GaugeChart;
