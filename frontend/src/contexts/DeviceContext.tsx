import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { useAuth, API_BASE_URL } from './AuthContext';

interface Device {
    id: number;
    device_id: string;
    name: string;
    location: string;
    user: number;
    user_username: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface DeviceContextType {
    devices: Device[];
    activeDevice: Device | null;
    isLoading: boolean;
    setActiveDevice: (device: Device | null) => void;
    fetchDevices: () => Promise<void>;
    createDevice: (name: string, location: string) => Promise<Device>;
    updateDevice: (deviceId: string, name: string, location: string) => Promise<void>;
    deleteDevice: (deviceId: string) => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [devices, setDevices] = useState<Device[]>([]);
    const [activeDevice, setActiveDeviceState] = useState<Device | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchDevices();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // Load active device from localStorage
        const storedDevice = localStorage.getItem('activeDevice');
        if (storedDevice) {
            setActiveDeviceState(JSON.parse(storedDevice));
        }
    }, []);

    const fetchDevices = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/monitoring/devices/`);
            setDevices(response.data.devices || []);

            // If no active device set and we have devices, set the first one
            if (!activeDevice && response.data.devices.length > 0) {
                setActiveDevice(response.data.devices[0]);
            }
        } catch (error) {
            console.error('Failed to fetch devices:', error);
            setDevices([]);
        } finally {
            setIsLoading(false);
        }
    };

    const setActiveDevice = (device: Device | null) => {
        setActiveDeviceState(device);
        if (device) {
            localStorage.setItem('activeDevice', JSON.stringify(device));
        } else {
            localStorage.removeItem('activeDevice');
        }
    };

    const createDevice = async (name: string, location: string): Promise<Device> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/monitoring/devices/`, {
                name,
                location,
                is_active: true
            });

            await fetchDevices();

            // Set as active device if it's the first one
            if (devices.length === 0) {
                setActiveDevice(response.data);
            }

            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to create device');
        }
    };

    const updateDevice = async (deviceId: string, name: string, location: string) => {
        try {
            await axios.put(`${API_BASE_URL}/monitoring/devices/${deviceId}/`, {
                name,
                location
            });

            await fetchDevices();

            // Update active device if it was the one updated
            if (activeDevice?.device_id === deviceId) {
                const updated = devices.find(d => d.device_id === deviceId);
                if (updated) {
                    setActiveDevice(updated);
                }
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to update device');
        }
    };

    const deleteDevice = async (deviceId: string) => {
        try {
            await axios.delete(`${API_BASE_URL}/monitoring/devices/${deviceId}/`);

            // If deleted device was active, clear it
            if (activeDevice?.device_id === deviceId) {
                setActiveDevice(null);
            }

            await fetchDevices();
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to delete device');
        }
    };

    const value = {
        devices,
        activeDevice,
        isLoading,
        setActiveDevice,
        fetchDevices,
        createDevice,
        updateDevice,
        deleteDevice
    };

    return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
};

export const useDevice = () => {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error('useDevice must be used within a DeviceProvider');
    }
    return context;
};
