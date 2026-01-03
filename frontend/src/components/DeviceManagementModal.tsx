import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, MapPin, Power } from 'lucide-react';
import { useDevice } from '../contexts/DeviceContext';

interface DeviceManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DeviceManagementModal: React.FC<DeviceManagementModalProps> = ({ isOpen, onClose }) => {
    const { devices, activeDevice, setActiveDevice, createDevice, updateDevice, deleteDevice, fetchDevices } = useDevice();
    const [isAdding, setIsAdding] = useState(false);
    const [editingDevice, setEditingDevice] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', location: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (editingDevice) {
                await updateDevice(editingDevice, formData.name, formData.location);
            } else {
                await createDevice(formData.name, formData.location);
            }
            setFormData({ name: '', location: '' });
            setIsAdding(false);
            setEditingDevice(null);
            await fetchDevices();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (device: any) => {
        setEditingDevice(device.device_id);
        setFormData({ name: device.name, location: device.location });
        setIsAdding(true);
    };

    const handleDelete = async (deviceId: string) => {
        if (!confirm('Are you sure you want to delete this device?')) return;

        setIsLoading(true);
        try {
            await deleteDevice(deviceId);
            await fetchDevices();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', location: '' });
        setIsAdding(false);
        setEditingDevice(null);
        setError('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">Device Management</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {error && (
                        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Add Device Button */}
                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full mb-6 p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-gray-700/50 transition flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add New Device</span>
                        </button>
                    )}

                    {/* Add/Edit Form */}
                    {isAdding && (
                        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {editingDevice ? 'Edit Device' : 'Add New Device'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Device Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g., Living Room Sensor"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g., Living Room"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition"
                                    >
                                        {isLoading ? 'Saving...' : editingDevice ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Device List */}
                    <div className="space-y-3">
                        {devices.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Power className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No devices yet. Add your first device to get started!</p>
                            </div>
                        ) : (
                            devices.map((device) => (
                                <div
                                    key={device.device_id}
                                    className={`p-4 rounded-lg border transition ${activeDevice?.device_id === device.device_id
                                        ? 'bg-blue-900/30 border-blue-500'
                                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-white">{device.name}</h3>
                                                {activeDevice?.device_id === device.device_id && (
                                                    <span className="px-2 py-0.5 bg-blue-600 text-xs text-white rounded-full">
                                                        Active
                                                    </span>
                                                )}
                                            </div>

                                            {device.location && (
                                                <div className="flex items-center gap-1 text-sm text-gray-400 mb-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{device.location}</span>
                                                </div>
                                            )}

                                            <div className="text-xs text-gray-500">
                                                ID: {device.device_id}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {activeDevice?.device_id !== device.device_id && (
                                                <button
                                                    onClick={() => setActiveDevice(device)}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                                                >
                                                    Set Active
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleEdit(device)}
                                                className="p-2 hover:bg-gray-600 rounded-lg transition"
                                            >
                                                <Edit2 className="w-4 h-4 text-gray-400" />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(device.device_id)}
                                                className="p-2 hover:bg-red-900/50 rounded-lg transition"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceManagementModal;
