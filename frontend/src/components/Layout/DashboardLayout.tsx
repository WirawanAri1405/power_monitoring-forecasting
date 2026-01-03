import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, TrendingUp, Zap, ChevronDown, Settings, LogOut, Sun, Moon, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useDevice } from '../../contexts/DeviceContext';
import { useTheme } from '../../contexts/ThemeContext';
import DeviceManagementModal from '../DeviceManagementModal';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

interface NavItem {
    name: string;
    path: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Monitoring', path: '/monitoring', icon: Activity },
    { name: 'Prediction', path: '/prediction', icon: TrendingUp },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { devices, activeDevice, setActiveDevice } = useDevice();
    const { theme, toggleTheme } = useTheme();

    const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 transition-all duration-300 lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                isCollapsed ? "lg:w-20" : "lg:w-72",
                "w-72" // Mobile always full width
            )}>
                {/* Logo/Brand */}
                <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/50 justify-between">
                    <div className={cn("flex items-center gap-3", isCollapsed && "lg:justify-center lg:w-full")}>
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className={cn(
                            "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 transition-opacity duration-300",
                            isCollapsed && "lg:hidden"
                        )}>
                            Wattara
                        </span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Collapse Toggle Button (Desktop Only) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all shadow-sm z-10"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Active Device Selector */}
                <div className="px-6 py-6">
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">
                        Active Device
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl flex items-center justify-between transition-all duration-200 shadow-sm"
                        >
                            <div className="flex-1 text-left overflow-hidden mr-2">
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                    {activeDevice ? activeDevice.name : 'Select Device'}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {activeDevice?.location || 'No location set'}
                                </div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        {/* Device Dropdown */}
                        {showDeviceDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                {devices.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                        No devices available
                                    </div>
                                ) : (
                                    <div className="p-1">
                                        {devices.map((device) => (
                                            <button
                                                key={device.device_id}
                                                onClick={() => {
                                                    setActiveDevice(device);
                                                    setShowDeviceDropdown(false);
                                                }}
                                                className={cn(
                                                    'w-full px-3 py-2 text-left rounded-lg transition-colors flex items-center gap-3',
                                                    activeDevice?.device_id === device.device_id
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                                                )}
                                            >
                                                <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                                                <div className="flex-1 truncate">
                                                    <div className="text-sm font-medium">{device.name}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="p-1 border-t border-slate-100 dark:border-slate-700/50">
                                    <button
                                        onClick={() => {
                                            setShowDeviceModal(true);
                                            setShowDeviceDropdown(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Manage Devices</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-4 mt-2">
                        Menu
                    </div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    'flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group',
                                    isActive
                                        ? 'bg-blue-600 shadow-md shadow-blue-500/25 text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                                )}
                            >
                                <Icon className={cn("w-5 h-5 mr-3 transition-colors", isActive ? "text-white" : "group-hover:text-blue-600 dark:group-hover:text-blue-400")} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-full flex items-center p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="ml-3 text-left flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                    {user?.username || 'User'}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {user?.email || 'user@wattara.com'}
                                </div>
                            </div>
                            <Settings className="w-4 h-4 text-slate-400" />
                        </button>
                        {/* User Menu Dropdown */}
                        {showUserMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <div className="p-1">
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-3"
                                    >
                                        {theme === 'light' ? <Moon className="w-4 h-4 text-slate-500" /> : <Sun className="w-4 h-4 text-slate-500" />}
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors flex items-center gap-3 text-red-600 dark:text-red-400"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm font-medium">Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-lg text-slate-800 dark:text-slate-100">Wattara</span>
                    <div className="w-8" /> {/* Spacer */}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
                    <div className="w-full space-y-6">
                        {/* Page Title & Actions Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    {navItems.find((item) => item.path === location.pathname)?.name || 'Dashboard'}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Overview of your energy consumption
                                </p>
                            </div>

                            {/* Top Right Actions (Desktop) */}
                            <div className="hidden lg:flex items-center gap-3">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
                                >
                                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => setShowDeviceModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium"
                                >
                                    <Zap className="w-4 h-4" />
                                    Add Device
                                </button>
                            </div>
                        </div>

                        {children}
                    </div>
                </main>
            </div>

            {/* Device Management Modal - Ensure it's rendered at root level z-index */}
            {showDeviceModal && (
                <DeviceManagementModal
                    isOpen={showDeviceModal}
                    onClose={() => setShowDeviceModal(false)}
                />
            )}

            {/* Click outside to close dropdowns (Global handler if needed, but local handlers work well) */}
            {(showDeviceDropdown || showUserMenu) && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => {
                        setShowDeviceDropdown(false);
                        setShowUserMenu(false);
                    }}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
