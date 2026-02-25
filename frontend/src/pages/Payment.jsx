import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Navbar from '../components/landing/navbar';
import Footer from '../components/landing/footer';
import api from '../services/api';
import { Banknote, Smartphone, CheckCircle, ArrowLeft, Receipt, User, Hash, Calendar } from 'lucide-react';

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { clearCart } = useCart();

    const { orderId, total } = location.state || {};
    const [step, setStep] = useState('choose'); // 'choose' | 'processing' | 'cash-success'
    const [receipt, setReceipt] = useState(null);
    const [error, setError] = useState(null);

    // Token status color map
    const statusColors = {
        PREPARING: 'bg-yellow-100 text-yellow-700',
        READY: 'bg-green-100 text-green-700',
        COLLECTED: 'bg-gray-100 text-gray-500'
    };

    // Handle cash payment
    const handleCashPayment = async () => {
        setStep('processing');
        setError(null);
        try {
            const response = await api.post('/payments/cash', { orderId });
            clearCart(); // Clear cart only after successful cash payment
            setReceipt(response.data);
            setStep('cash-success');
        } catch (err) {
            console.error('Payment error:', err);
            setError(err?.response?.data?.error || 'Payment failed. Please try again.');
            setStep('choose');
            // Note: Cart items are preserved on payment failure
        }
    };

    // Handle khalti - redirect to khalti payment flow
    const handleKhaltiPayment = () => {
        navigate('/khalti-payment', { state: { orderId, total } });
    };

    // If no order data, redirect back
    if (!orderId) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-700 mb-4">No order found</h1>
                        <button
                            onClick={() => navigate('/menu')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                        >
                            Go to Menu
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="pt-24 pb-12">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Error notification */}
                        {error && (
                            <div className="mb-6 px-4 py-3 rounded-lg bg-red-500 text-white shadow-lg">
                                {error}
                            </div>
                        )}

                        {/* STEP 1: Choose Payment Method */}
                        {step === 'choose' && (
                            <div>
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span>Back to Cart</span>
                                </button>

                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Payment Method</h1>
                                    <p className="text-gray-500">Order Total: <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Rs. {total}</span></p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Cash Option */}
                                    <button
                                        onClick={handleCashPayment}
                                        className="group bg-white rounded-2xl shadow-md hover:shadow-xl p-8 transition-all duration-300 border-2 border-transparent hover:border-green-400 text-left"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-5 group-hover:bg-green-200 transition-colors">
                                            <Banknote className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Cash</h3>
                                        <p className="text-gray-500 text-sm">Pay at the counter when you collect your order</p>
                                    </button>

                                    {/* Khalti Option */}
                                    <button
                                        onClick={handleKhaltiPayment}
                                        className="group bg-white rounded-2xl shadow-md hover:shadow-xl p-8 transition-all duration-300 border-2 border-transparent hover:border-purple-400 text-left"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-5 group-hover:bg-purple-200 transition-colors">
                                            <Smartphone className="w-8 h-8 text-purple-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Khalti</h3>
                                        <p className="text-gray-500 text-sm">Pay online using your Khalti digital wallet</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PROCESSING */}
                        {step === 'processing' && (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                                <h2 className="text-xl font-semibold text-gray-700">Processing Payment...</h2>
                            </div>
                        )}

                        {/* STEP 2: Cash Success — Receipt/Ticket */}
                        {step === 'cash-success' && receipt && (
                            <div>
                                {/* Success header */}
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-12 h-12 text-green-500" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-1">Payment Successful!</h1>
                                    <p className="text-gray-500">Your order has been placed</p>
                                </div>

                                {/* Receipt Ticket */}
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto">
                                    {/* Ticket header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 text-white text-center">
                                        <Receipt className="w-6 h-6 mx-auto mb-1 opacity-80" />
                                        <h2 className="text-sm font-bold tracking-wide">ORDER RECEIPT</h2>
                                        <div className="mt-2 bg-white/20 rounded-lg py-2 px-3">
                                            <p className="text-[10px] uppercase tracking-widest opacity-80">Token Number</p>
                                            <p className="text-3xl font-extrabold">#{String(receipt.token.tokenNumber).padStart(4, '0')}</p>
                                        </div>
                                    </div>

                                    {/* Ticket body */}
                                    <div className="px-5 py-4 space-y-3">
                                        {/* Customer info */}
                                        <div className="flex items-center gap-2 pb-3 border-b border-dashed border-gray-200">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Customer</p>
                                                <p className="text-sm font-semibold text-gray-800">{receipt.customer.name}</p>
                                                <p className="text-[10px] text-gray-400">ID: #{receipt.customer.id}</p>
                                            </div>
                                        </div>

                                        {/* Order ID & Date */}
                                        <div className="flex justify-between pb-3 border-b border-dashed border-gray-200">
                                            <div className="flex items-center gap-1.5">
                                                <Hash className="w-3.5 h-3.5 text-gray-400" />
                                                <div>
                                                    <p className="text-[10px] text-gray-400">Order ID</p>
                                                    <p className="text-sm font-semibold text-gray-700">#{receipt.order.id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-400">Date</p>
                                                    <p className="text-sm font-semibold text-gray-700">{new Date(receipt.order.orderDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="pb-3 border-b border-dashed border-gray-200">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Items Ordered</p>
                                            <div className="space-y-1.5">
                                                {receipt.items.map((item, index) => (
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
                                                Rs. {receipt.order.totalAmt}
                                            </p>
                                        </div>

                                        {/* Token Status */}
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Token Status</p>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusColors[receipt.token.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {receipt.token.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Ticket footer */}
                                    <div className="bg-gray-50 px-5 py-3 text-center border-t border-dashed border-gray-200">
                                        <p className="text-xs text-gray-500 font-medium">
                                            🎫 Show this token at the counter to collect your order
                                        </p>
                                    </div>
                                </div>

                                {/* Action button */}
                                <div className="text-center mt-8">
                                    <button
                                        onClick={() => navigate('/menu')}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                                    >
                                        Back to Menu
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
