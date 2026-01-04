import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Zap, MapPin, MoreVertical, Plus, Server, TrendingUp, AlertCircle } from 'lucide-react';
import { useDevice } from '../contexts/DeviceContext';
import DeviceManagementModal from '../components/DeviceManagementModal';

const DashboardPage: React.FC = () => {
  const { devices, setActiveDevice, activeDevice } = useDevice();
  const navigate = useNavigate();
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  // Mock stats - in a real app, these would come from the backend or calculated from device data
  const totalConsumption = "1,234 kWh"; // Placeholder
  const activeAlerts = 2; // Placeholder
  const onlineDevices = devices.length; // Assuming all are online for now

  const handleDeviceAction = (device: any, path: string) => {
    setActiveDevice(device);
    navigate(path);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Devices"
          value={devices.length.toString()}
          icon={Server}
          color="blue"
          trend="+1 this month"
        />
        <StatCard
          title="Online Devices"
          value={onlineDevices.toString()}
          icon={Activity}
          color="green"
          trend="100% uptime"
        />
        <StatCard
          title="Total Consumption"
          value={totalConsumption}
          icon={Zap}
          color="orange"
          trend="+12% vs last month"
          trendDown={true}
        />
        <StatCard
          title="Active Alerts"
          value={activeAlerts.toString()}
          icon={AlertCircle}
          color="red"
          trend="Needs attention"
        />
      </div>

      {/* Devices Section */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Connected Devices</h2>
          <button
            onClick={() => setShowDeviceModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Device
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No devices found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              Start monitoring your energy consumption by adding your first IoT device.
            </p>
            <button
              onClick={() => setShowDeviceModal(true)}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Add Device Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div
                key={device.device_id}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 ${activeDevice?.device_id === device.device_id
                    ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Online
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Device Info */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">
                    {device.name}
                  </h3>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-6">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    <span className="truncate">{device.location || 'Unknown Location'}</span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleDeviceAction(device, '/monitoring')}
                      className="flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Monitor
                    </button>
                    <button
                      onClick={() => handleDeviceAction(device, '/prediction')}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Predict
                    </button>
                  </div>
                </div>

                {/* Active Indicator Bar */}
                {activeDevice?.device_id === device.device_id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <DeviceManagementModal
        isOpen={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'orange' | 'red';
  trend: string;
  trendDown?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend, trendDown }) => {
  const colorStyles = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' }
  };

  const styles = colorStyles[color];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${styles.bg} ${styles.text}`}>
          <Icon className="w-6 h-6" />
        </div>
        {/* Optional trend indicator could go here */}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h4>
      </div>
      <div className="mt-4 flex items-center text-xs">
        <span className={`font-medium ${trendDown ? 'text-red-500' : 'text-green-500'}`}>
          {trend}
        </span>
        <span className="text-slate-400 ml-2">from last month</span>
      </div>
    </div>
  );
};

export default DashboardPage;