import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from './sidebar';
import MenuItems from './menuitems';
import ManageCustomer from './ManageCustomer';
import ManageOrder from './ManageOrder';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        pendingOrders: 0
    });

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            navigate('/customer/dashboard');
            return;
        }

        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/stats/admin', {
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

        if (user && user.role === 'ADMIN') {
            fetchStats();
        }
    }, [user, navigate]);


    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);

        }
    }, [location.state]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="ml-64 flex-1">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-8 py-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* User Profile */}
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</span>
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
                    {activeTab === 'dashboard' && <DashboardContent stats={stats} />}
                    {activeTab === 'orders' && <OrdersContent />}
                    {activeTab === 'menu' && <MenuContent />}
                    {activeTab === 'customers' && <CustomersContent />}
                    {activeTab === 'analytics' && <AnalyticsContent />}
                    {activeTab === 'settings' && <SettingsContent />}
                </main>
            </div>
        </div>
    );
}

function DashboardContent({ stats }) {
    const [processingOrders, setProcessingOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchProcessingOrders = useCallback(async () => {
        try {
            setLoadingOrders(true);
            const response = await fetch('http://localhost:3000/api/orders/admin/all', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProcessingOrders(data.filter(o => o.status === 'PROCESSING'));
            }
        } catch (err) {
            console.error('Failed to fetch processing orders:', err);
        } finally {
            setLoadingOrders(false);
        }
    }, []);

    useEffect(() => { fetchProcessingOrders(); }, [fetchProcessingOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        if (newStatus === 'CANCELLED' && !window.confirm(`Cancel order #${orderId}? Stock will be restored.`)) return;
        setUpdatingId(orderId);
        try {
            const res = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setProcessingOrders(prev => prev.filter(o => o.id !== orderId));
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to update status');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    change="+12.5%"
                    trend="up"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    }
                    color="blue"
                />
                <StatCard
                    title="Revenue"
                    value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
                    change="+8.2%"
                    trend="up"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="green"
                />
                <StatCard
                    title="Customers"
                    value={stats.totalCustomers}
                    change="+3.1%"
                    trend="up"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                    color="purple"
                />
                <StatCard
                    title="Pending"
                    value={processingOrders.length || stats.pendingOrders}
                    change="live"
                    trend="down"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="orange"
                />
            </div>

            {/* Processing Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Processing Orders</h3>
                        <p className="text-sm text-gray-400 mt-0.5">Orders waiting for action</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                        {processingOrders.length} pending
                    </span>
                </div>
                <div className="overflow-x-auto">
                    {loadingOrders ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : processingOrders.length === 0 ? (
                        <div className="py-12 text-center">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-500 font-medium">No pending orders — all clear!</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {processingOrders.map(order => (
                                    <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${updatingId === order.id ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-3 font-mono font-semibold text-gray-700">#{order.id}</td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-gray-800">{order.customer?.name || '—'}</div>
                                            <div className="text-xs text-gray-400">{order.customer?.email}</div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</td>
                                        <td className="px-6 py-3 font-semibold text-gray-800">Rs. {order.totalAmt}</td>
                                        <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                                            {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                                                    disabled={updatingId === order.id}
                                                    className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    ✓ Complete
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                                                    disabled={updatingId === order.id}
                                                    className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    ✕ Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, trend, icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm text-gray-600 mt-1">{title}</p>
        </div>
    );
}

function OrdersContent() {
    return <ManageOrder />;
}

function MenuContent() {
    return <MenuItems />;
}

function CustomersContent() {
    return <ManageCustomer />;
}

function AnalyticsContent() {
    return <div className="text-gray-600">Analytics</div>;
}
