import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Navbar from '../components/landing/navbar';
import Footer from '../components/landing/footer';
import api from '../services/api';
import { CheckCircle, Loader, XCircle } from 'lucide-react';

export default function KhaltiReturn() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { clearCart } = useCart();
    
    const verifyingRef = useRef(false);
    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'failed'
    const [receipt, setReceipt] = useState(null);
    const [error, setError] = useState(null);

    const tokenStatusColors = {
        PREPARING: 'text-yellow-600',
        READY: 'text-blue-600',
        COLLECTED: 'text-green-600',
        CANCELLED: 'text-red-600'
    };

    useEffect(() => {
        const verifyPayment = async () => {
            const pidx = searchParams.get('pidx');
            const orderId = searchParams.get('orderId');
            const paymentId = searchParams.get('paymentId');

            if (!pidx || !orderId || !paymentId) {
                setError('Invalid payment parameters');
                setStatus('failed');
                return;
            }

            if (verifyingRef.current) return;
            verifyingRef.current = true;

            try {
                const response = await api.post('/payments/khalti/verify', {
                    pidx,
                    orderId: parseInt(orderId),
                    paymentId: parseInt(paymentId)
                });

                if (response.data.success) {
                    setReceipt(response.data.data);
                    clearCart(); // Only clear cart after confirmed successful payment
                    setStatus('success');
                } else {
                    setError(response.data.error || 'Payment verification failed');
                    setStatus('failed');
                    // Cart remains untouched on failure - items stay for retry
                }
            } catch (err) {
                console.error('Payment verification error:', err);
                setError(err?.response?.data?.error || 'Payment verification failed');
                setStatus('failed');
            } finally {
                // Clean up URL
                searchParams.delete('pidx');
                searchParams.delete('orderId');
                searchParams.delete('paymentId');
                setSearchParams(searchParams, { replace: true });
            }
        };

        if (!user) {
            navigate('/login');
        } else {
            verifyPayment();
        }
    }, [searchParams, user, navigate, clearCart, setSearchParams]);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="pt-24 pb-12">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Verifying */}
                        {status === 'verifying' && (
                            <div className="text-center">
                                <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
                                <h1 className="text-3xl font-bold text-gray-800 mb-4">Verifying Payment</h1>
                                <p className="text-gray-600">Please wait while we confirm your payment...</p>
                            </div>
                        )}

                        {/* Success */}
                        {status === 'success' && receipt && (
                            <div className="bg-white rounded-lg shadow-lg p-8">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
                                    <p className="text-gray-600">Your order has been received and is being prepared.</p>
                                </div>

                                {/* Receipt */}
                                <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Order Receipt</h2>

                                    {/* Order Info */}
                                    <div className="mb-6 pb-6 border-b border-gray-200">
                                        <p className="text-sm text-gray-600 mb-2">Order ID</p>
                                        <p className="text-lg font-semibold text-gray-800">#{receipt.order.id}</p>
                                    </div>

                                    {/* Items */}
                                    <div className="mb-6 pb-6 border-b border-gray-200">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Items</h3>
                                        <div className="space-y-3">
                                            {receipt.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{item.name}</p>
                                                        <p className="text-sm text-gray-600">x{item.qty} @ Rs. {item.price}</p>
                                                    </div>
                                                    <p className="font-semibold text-gray-800">Rs. {item.subtotal}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="mb-6 pb-6 border-b border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xl font-bold text-gray-800">Total Amount</p>
                                            <p className="text-2xl font-bold text-blue-600">Rs. {receipt.order.totalAmt}</p>
                                        </div>
                                    </div>

                                    {/* Token */}
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-2">Your Token Number</p>
                                        <p className="text-4xl font-bold text-green-600 mb-2">{receipt.token.tokenNumber}</p>
                                        <p className="text-sm text-gray-600">Status: <span className={`font-semibold ${tokenStatusColors[receipt.token.status] || 'text-gray-600'}`}>{receipt.token.status}</span></p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => navigate('/user/orders')}
                                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
                                    >
                                        My Orders
                                    </button>
                                    <button
                                        onClick={() => navigate('/menu')}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                                    >
                                        Order More
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Failed */}
                        {status === 'failed' && (
                            <div className="bg-white rounded-lg shadow-lg p-8">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <XCircle className="w-12 h-12 text-red-600" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-red-600 mb-2">Payment Failed</h1>
                                    <p className="text-gray-600">{error || 'Unable to verify your payment'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => navigate('/cart')}
                                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
                                    >
                                        Back to Cart
                                    </button>
                                    <button
                                        onClick={() => navigate('/payment')}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
