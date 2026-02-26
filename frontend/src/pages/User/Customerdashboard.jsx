import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CustomerSidebar from './csidebar';
import api from '../../services/api';
import OrdersContent from './order';

export default function CustomerDashboard() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0
    });


    useEffect(() => {
        // If still loading, wait
        if (loading) return;

        // Redirect if admin or not authenticated
        if (!user || user.role === 'ADMIN') {
            navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : '/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/stats/customer', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, [user, loading, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Show loading screen while auth is being verified
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Redirect if not customer
    if (!user || user.role !== 'CUSTOMER') {
        return null;
    }

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
                            {/* User Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-3 focus:outline-none"
                                >
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20">
                                        <button
                                            onClick={() => navigate('/')}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Home
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-8">
                    {activeTab === 'dashboard' && <DashboardContent stats={stats} />}
                    {activeTab === 'orders' && <OrdersContent />}
                    {activeTab === 'tokens' && <TokensContent />}
                    {activeTab === 'settings' && <SettingsContent />}
                </main>
            </div>
        </div>
    );
}

function DashboardContent({ stats }) {
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
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
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
                            <p className="text-2xl font-bold text-gray-900">Rs. {stats.totalSpent.toLocaleString()}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
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

function TokensContent() {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedToken, setSelectedToken] = useState(null);

    const statusColors = {
        COMPLETED: 'bg-green-100 text-green-700',
        PROCESSING: 'bg-amber-100 text-amber-700',
        CANCELLED: 'bg-red-100 text-red-700',
        INCART: 'bg-blue-100 text-blue-700'
    };

    const tokenStatusColors = {
        PREPARING: 'bg-yellow-100 text-yellow-700',
        READY: 'bg-green-100 text-green-700',
        COLLECTED: 'bg-gray-100 text-gray-500',
        CANCELLED: 'bg-red-100 text-red-700'
    };

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const response = await api.get('/payments/tokens');
                setTokens(response.data);
            } catch (error) {
                console.error('Error fetching tokens:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTokens();
        // Auto-refresh every 30s to reflect status changes made by admin
        const interval = setInterval(fetchTokens, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (tokens.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No tokens yet</h3>
                <p className="text-gray-400 text-sm">Tokens will appear here after you place an order</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {tokens.map((token) => (
                    <div key={token.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Token header */}
                        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-extrabold">#{String(token.tokenNumber).padStart(4, '0')}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${tokenStatusColors[token.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {token.status}
                                </span>
                            </div>
                            <span className="text-xs opacity-80">{new Date(token.createdAt).toLocaleDateString()}</span>
                        </div>
                        {/* Token body */}
                        <div className="px-5 py-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">Order #{token.order.id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColors[token.order.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {token.order.status}
                                </span>
                            </div>
                            <div className="space-y-1 mb-2">
                                {token.order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.name} × {item.qty}</span>
                                        <span className="font-medium text-gray-700">Rs. {item.qty * item.price}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="text-sm font-bold text-gray-800">Total</span>
                                <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Rs. {token.order.totalAmt}</span>
                            </div>
                            <button
                                onClick={() => setSelectedToken(token)}
                                className="mt-3 w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                View Full Token
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Full Token Receipt Modal */}
            {selectedToken && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedToken(null)}>
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-sm w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Ticket header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 text-white text-center">
                            <svg className="w-6 h-6 mx-auto mb-1 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h2 className="text-sm font-bold tracking-wide">ORDER RECEIPT</h2>
                            <div className="mt-2 bg-white/20 rounded-lg py-2 px-3">
                                <p className="text-[10px] uppercase tracking-widest opacity-80">Token Number</p>
                                <p className="text-3xl font-extrabold">#{String(selectedToken.tokenNumber).padStart(4, '0')}</p>
                            </div>
                        </div>

                        {/* Ticket body */}
                        <div className="px-5 py-4 space-y-3">
                            {/* Customer info */}
                            <div className="flex items-center gap-2 pb-3 border-b border-dashed border-gray-200">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Customer</p>
                                    <p className="text-sm font-semibold text-gray-800">{selectedToken.customer.name}</p>
                                    <p className="text-[10px] text-gray-400">ID: #{selectedToken.customer.id}</p>
                                </div>
                            </div>

                            {/* Order ID & Date */}
                            <div className="flex justify-between pb-3 border-b border-dashed border-gray-200">
                                <div>
                                    <p className="text-[10px] text-gray-400">Order ID</p>
                                    <p className="text-sm font-semibold text-gray-700">#{selectedToken.order.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400">Date</p>
                                    <p className="text-sm font-semibold text-gray-700">{new Date(selectedToken.order.orderDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="pb-3 border-b border-dashed border-gray-200">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Items Ordered</p>
                                <div className="space-y-1.5">
                                    {selectedToken.order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{item.name}</p>
                                                <p className="text-[11px] text-gray-400">{item.qty} × Rs. {item.price}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-800">Rs. {item.subtotal}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                                <p className="text-base font-bold text-gray-800">Total</p>
                                <p className="text-lg font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Rs. {selectedToken.order.totalAmt}
                                </p>
                            </div>

                            {/* Token Status */}
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Token Status</p>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${tokenStatusColors[selectedToken.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {selectedToken.status}
                                </span>
                            </div>
                        </div>

                        {/* Ticket footer */}
                        <div className="bg-gray-50 px-5 py-3 text-center border-t border-dashed border-gray-200">
                            <p className="text-xs text-gray-500 font-medium">
                                {selectedToken.status === 'COLLECTED'
                                    ? '✅ Order has been collected'
                                    : selectedToken.status === 'CANCELLED'
                                    ? '❌ This order has been cancelled'
                                    : '🎫 Show this token at the counter to collect your order'}
                            </p>
                        </div>

                        {/* Close button */}
                        <div className="px-5 py-3">
                            <button
                                onClick={() => setSelectedToken(null)}
                                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
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
