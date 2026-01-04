import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useDevice } from '../contexts/DeviceContext';
import { API_BASE_URL } from '../contexts/AuthContext';
import axios from 'axios';
import GaugeChart from '../components/charts/GaugeChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';

interface SensorData {
    voltage: number;
    current: number;
    power: number;
    pf: number;
    frequency: number;
    energy: number;
    timestamp: string;
}

const MonitoringPageEnhanced: React.FC = () => {
    const { activeDevice } = useDevice();
    const [currentData, setCurrentData] = useState<SensorData>({
        voltage: 0,
        current: 0,
        power: 0,
        pf: 0,
        frequency: 0,
        energy: 0,
        timestamp: new Date().toISOString(),
    });

    const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState('1h');

    const timeRanges = [
        { label: '1 Hour', value: '1h' },
        { label: '6 Hours', value: '6h' },
        { label: '24 Hours', value: '24h' },
        { label: '7 Days', value: '7d' },
    ];

    const fetchHistory = useCallback(async (range: string) => {
        if (!activeDevice) return;

        try {
            setIsLoading(true);
            const response = await axios.get(
                `${API_BASE_URL}/monitoring/history/?device_id=${activeDevice.device_id}&range=${range}`
            );
            setHistoricalData(response.data.data || []);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch historical data');
        } finally {
            setIsLoading(false);
        }
    }, [activeDevice]);

    const fetchLatest = useCallback(async () => {
        if (!activeDevice) return;

        try {
            const response = await axios.get(
                `${API_BASE_URL}/monitoring/api/?device_id=${activeDevice.device_id}`
            );
            setCurrentData(response.data);
        } catch (err: any) {
            console.error('Error fetching latest data:', err);
        }
    }, [activeDevice]);

    useEffect(() => {
        if (activeDevice) {
            fetchHistory(timeRange);
            fetchLatest();
        }
    }, [activeDevice, timeRange, fetchHistory, fetchLatest]);

    useEffect(() => {
        if (!activeDevice) return;

        const interval = setInterval(fetchLatest, 2000); // Update every 2 seconds
        return () => clearInterval(interval);
    }, [activeDevice, fetchLatest]);

    if (!activeDevice) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No Device Selected</h3>
                    <p className="text-slate-600 dark:text-slate-400">Please select a device from the sidebar to view monitoring data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                        Real-time Monitoring
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Device: <span className="font-semibold text-slate-900 dark:text-slate-200">{activeDevice.name}</span>
                    </p>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <Clock className="w-4 h-4 ml-2 text-slate-400" />
                    {timeRanges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setTimeRange(range.value)}
                            className={cn(
                                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                                timeRange === range.value
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            )}
                        >
                            {range.label}
                        </button>
                    ))}
                    <button
                        onClick={() => fetchHistory(timeRange)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-l border-slate-100 dark:border-slate-700 ml-1"
                        title="Refresh History"
                    >
                        <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-red-800 dark:text-red-300">Connection Error</h4>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Gauge Meters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <GaugeChart
                    value={currentData.voltage}
                    min={0}
                    max={250}
                    unit="V"
                    label="Voltage"
                    thresholds={[
                        { max: 210, color: '#ef4444', label: 'Low' },
                        { max: 230, color: '#10b981', label: 'Normal' },
                        { max: 250, color: '#ef4444', label: 'High' }
                    ]}
                />

                <GaugeChart
                    value={currentData.current}
                    min={0}
                    max={20}
                    unit="A"
                    label="Current"
                    thresholds={[
                        { max: 15, color: '#10b981', label: 'Normal' },
                        { max: 18, color: '#f59e0b', label: 'Warning' },
                        { max: 20, color: '#ef4444', label: 'Critical' }
                    ]}
                />

                <GaugeChart
                    value={currentData.pf}
                    min={0}
                    max={1}
                    unit=""
                    label="Power Factor"
                    thresholds={[
                        { max: 0.7, color: '#ef4444', label: 'Poor' },
                        { max: 0.9, color: '#f59e0b', label: 'Fair' },
                        { max: 1, color: '#10b981', label: 'Good' }
                    ]}
                />

                <GaugeChart
                    value={currentData.frequency}
                    min={45}
                    max={55}
                    unit="Hz"
                    label="Frequency"
                    thresholds={[
                        { max: 49, color: '#ef4444', label: 'Low' },
                        { max: 51, color: '#10b981', label: 'Normal' },
                        { max: 55, color: '#ef4444', label: 'High' }
                    ]}
                />

                <GaugeChart
                    value={currentData.energy}
                    min={0}
                    max={999}
                    unit="kWh"
                    label="Total Energy"
                />
            </div>

            {/* Historical Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TimeSeriesChart
                    data={historicalData}
                    dataKey="voltage"
                    color="#3b82f6"
                    label="Voltage"
                    unit="V"
                />

                <TimeSeriesChart
                    data={historicalData}
                    dataKey="current"
                    color="#f59e0b"
                    label="Current"
                    unit="A"
                />

                <TimeSeriesChart
                    data={historicalData}
                    dataKey="power"
                    color="#10b981"
                    label="Power"
                    unit="W"
                />
            </div>

            {/* System Information */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">System Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Power Factor</p>
                        <p className="text-xl font-semibold text-slate-800 dark:text-white">{currentData.pf.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Frequency</p>
                        <p className="text-xl font-semibold text-slate-800 dark:text-white">{currentData.frequency.toFixed(1)} Hz</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                        <p className={cn(
                            "text-xl font-semibold",
                            currentData.voltage > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                            {currentData.voltage > 0 ? "Connected" : "Offline"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Last Update</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {new Date(currentData.timestamp).toLocaleTimeString('id-ID')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonitoringPageEnhanced;
