import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <--- IMPORT WAJIB UNTUK PORTAL
import { X, Plus, Trash2, Edit2, MapPin, Power } from 'lucide-react';
import { useDevice } from '../contexts/DeviceContext';

interface DeviceManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultToAdd?: boolean; // Prop opsional untuk langsung buka mode tambah
}

const DeviceManagementModal: React.FC<DeviceManagementModalProps> = ({ 
    isOpen, 
    onClose,
    defaultToAdd = false
}) => {
    const { devices, activeDevice, setActiveDevice, createDevice, updateDevice, deleteDevice, fetchDevices } = useDevice();
    
    // State management
    const [isAdding, setIsAdding] = useState(defaultToAdd);
    const [editingDevice, setEditingDevice] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', location: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset state ketika modal dibuka/ditutup atau prop berubah
    useEffect(() => {
        if (isOpen) {
            setIsAdding(defaultToAdd);
            setError('');
            setEditingDevice(null);
            setFormData({ name: '', location: '' });
        }
    }, [isOpen, defaultToAdd]);

    // Jika modal tidak open, jangan render apa-apa
    if (!isOpen) return null;

    // Logic Handlers
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
            // Reset form setelah sukses
            setFormData({ name: '', location: '' });
            setIsAdding(false);
            setEditingDevice(null);
            await fetchDevices();
        } catch (err: any) {
            setError(err.message || 'Failed to save device');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (device: any) => {
        setEditingDevice(device.device_id);
        setFormData({ name: device.name, location: device.location || '' });
        setIsAdding(true);
    };

    const handleDelete = async (deviceId: string) => {
        if (!window.confirm('Are you sure you want to delete this device?')) return;

        setIsLoading(true);
        try {
            await deleteDevice(deviceId);
            await fetchDevices();
        } catch (err: any) {
            setError(err.message || 'Failed to delete device');
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

    // --- RENDER DENGAN REACT PORTAL ---
    // createPortal(JSX, target_element)
    // Ini akan memindahkan render modal keluar dari komponen induknya dan masuk ke <body>
    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans animate-fade-in">
            {/* Tips: Saya ubah max-w-2xl menjadi max-w-4xl agar modal lebih lebar dan lega 
               saat list device-nya panjang.
            */}
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-700 ring-1 ring-white/10">
                
                {/* Header Modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {isAdding ? (editingDevice ? 'Edit Device' : 'Add New Device') : 'Device Management'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body Content (Scrollable) */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3 text-red-200 text-sm">
                           <div className="p-1 bg-red-500 rounded-full mt-0.5">
                                <X className="w-3 h-3 text-white" />
                           </div>
                           <span>{error}</span>
                        </div>
                    )}

                    {/* Mode: LIST DEVICES */}
                    {!isAdding && (
                        <>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full mb-6 p-4 border-2 border-dashed border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-500/5 transition-all group flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400"
                            >
                                <div className="p-1 bg-gray-700 group-hover:bg-blue-500 rounded-lg transition-colors text-white">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Add New Device</span>
                            </button>

                            <div className="space-y-3">
                                {devices.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Power className="w-8 h-8 text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-white mb-1">No Devices Found</h3>
                                        <p className="text-gray-400">Add your first device to get started!</p>
                                    </div>
                                ) : (
                                    devices.map((device) => (
                                        <div
                                            key={device.device_id}
                                            className={`p-4 rounded-xl border transition-all ${
                                                activeDevice?.device_id === device.device_id
                                                ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                                : 'bg-gray-700/30 border-gray-700 hover:border-gray-500'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-semibold text-white truncate">{device.name}</h3>
                                                        {activeDevice?.device_id === device.device_id && (
                                                            <span className="px-2.5 py-0.5 bg-blue-500 text-xs font-bold text-white rounded-full">
                                                                ACTIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        {device.location && (
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                <span className="truncate">{device.location}</span>
                                                            </div>
                                                        )}
                                                        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-300 font-mono">
                                                            ID: {device.device_id}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {activeDevice?.device_id !== device.device_id && (
                                                        <button
                                                            onClick={() => setActiveDevice(device)}
                                                            className="px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-blue-600 hover:text-white text-gray-300 rounded-lg transition-colors"
                                                        >
                                                            Set Active
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(device)}
                                                        className="p-2 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(device.device_id)}
                                                        className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {/* Mode: FORM (ADD/EDIT) */}
                    {isAdding && (
                        <form onSubmit={handleSubmit} className="animate-fade-in">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Device Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Smart Meter - Living Room"
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Location <span className="text-gray-500 text-xs">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g. 2nd Floor"
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                                Saving...
                                            </span>
                                        ) : (
                                            editingDevice ? 'Update Device' : 'Create Device'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        document.body // Target: Langsung ke element <body>
    );
};

export default DeviceManagementModal;