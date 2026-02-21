import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function OrdersContent() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const statusConfig = {
        PROCESSING: { label: 'Processing', classes: 'bg-amber-100 text-amber-700' },
        COMPLETED: { label: 'Completed', classes: 'bg-green-100 text-green-700' },
        CANCELLED: { label: 'Cancelled', classes: 'bg-red-100 text-red-700' },
        INCART: { label: 'In Cart', classes: 'bg-blue-100 text-blue-700' },
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 text-center">
                <svg className="w-12 h-12 text-red-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-500 font-medium">{error}</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No orders yet</h3>
                <p className="text-gray-400 text-sm">Your order history will appear here once you place an order.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Order History</h3>
                <p className="text-sm text-gray-400 mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <th className="text-left px-6 py-3 font-semibold">Order ID</th>
                            <th className="text-left px-6 py-3 font-semibold">Date</th>
                            <th className="text-left px-6 py-3 font-semibold">Items</th>
                            <th className="text-left px-6 py-3 font-semibold">Total</th>
                            <th className="text-left px-6 py-3 font-semibold">Status</th>
                            <th className="text-left px-6 py-3 font-semibold">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => {
                            const cfg = statusConfig[order.status] || { label: order.status, classes: 'bg-gray-100 text-gray-700' };
                            const isExpanded = expandedOrder === order.id;
                            return (
                                <>
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-semibold text-gray-700">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(order.orderDate).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                            <div className="text-xs text-gray-400">
                                                {new Date(order.orderDate).toLocaleTimeString('en-US', {
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">
                                            Rs. {order.totalAmt}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 transition-colors"
                                            >
                                                {isExpanded ? 'Hide' : 'View'}
                                                <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded items row */}
                                    {isExpanded && (
                                        <tr key={`${order.id}-expanded`} className="bg-indigo-50/40">
                                            <td colSpan={6} className="px-8 py-4">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items Ordered</p>
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-gray-400 text-xs">
                                                            <th className="text-left pb-1 font-medium">Item</th>
                                                            <th className="text-center pb-1 font-medium">Qty</th>
                                                            <th className="text-right pb-1 font-medium">Unit Price</th>
                                                            <th className="text-right pb-1 font-medium">Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-indigo-100">
                                                        {order.orderItems.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td className="py-1.5 text-gray-700 font-medium">{item.food?.name || 'Item'}</td>
                                                                <td className="py-1.5 text-center text-gray-500">{item.qty}</td>
                                                                <td className="py-1.5 text-right text-gray-500">Rs. {item.price}</td>
                                                                <td className="py-1.5 text-right font-semibold text-gray-800">Rs. {item.qty * item.price}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="border-t border-indigo-200">
                                                            <td colSpan={3} className="pt-2 text-right font-bold text-gray-700">Total</td>
                                                            <td className="pt-2 text-right font-extrabold text-indigo-600">Rs. {order.totalAmt}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
