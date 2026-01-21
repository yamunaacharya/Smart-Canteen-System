import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CustomerSidebar from './csidebar';

export default function CustomerDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        // Redirect if admin
        if (user && user.role === 'ADMIN') {
            navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <CustomerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <div className="ml-64 flex-1">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-8 py-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {activeTab === 'profile' ? 'Profile' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Cart Icon */}
                            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    0
                                </span>
                            </button>

                            {/* User Profile */}
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-8">
                    {activeTab === 'dashboard' && <DashboardContent />}
                    {activeTab === 'orders' && <OrdersContent />}
                    {activeTab === 'settings' && <SettingsContent />}
                </main>
            </div>
        </div>
    );
}

function DashboardContent() {
    return (
        <div>
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Your Dashboard</h3>
                <p className="text-gray-600">Quick overview of your account</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900">Rs. 0</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrdersContent() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Orders</h3>
            <p className="text-gray-500">No orders yet</p>
        </div>
    );
}

function SettingsContent() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
            <p className="text-gray-500">Settings content here</p>
        </div>
    );
}
