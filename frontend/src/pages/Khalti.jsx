import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/landing/navbar';
import Footer from '../components/landing/footer';
import api from '../services/api';
import { ArrowLeft, Smartphone, CheckCircle, Loader } from 'lucide-react';

export default function KhaltiPayment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { orderId, total } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState('processing'); // 'processing' | 'success' | 'failed'

    useEffect(() => {
        if (!orderId) {
            navigate('/cart');
            return;
        }

        // Initiate Khalti payment
        const initiatePayment = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.post('/payments/khalti/initiate', { orderId });

                if (response.data.success) {
                    // Store paymentId and orderId in localStorage for retrieval on return
                    localStorage.setItem('khaltiPaymentData', JSON.stringify({
                        orderId: response.data.data.orderId,
                        paymentId: response.data.data.paymentId,
                        timestamp: Date.now()
                    }));
                    console.log('Stored Khalti payment data in localStorage');
                    
                    // Redirect to Khalti's payment page
                    window.location.href = response.data.data.paymentUrl;
                } else {
                    setError(response.data.error || 'Failed to initiate payment');
                    setStep('failed');
                }
            } catch (err) {
                console.error('Error initiating Khalti payment:', err);
                setError(err?.response?.data?.error || 'Failed to initiate payment');
                setStep('failed');
            } finally {
                setLoading(false);
            }
        };

        initiatePayment();
    }, [orderId, navigate]);

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
                        <button
                            onClick={() => navigate('/payment', { state: { orderId, total } })}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Payment Methods</span>
                        </button>

                        {/* Processing */}
                        {step === 'processing' && (
                            <div className="text-center">
                                <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
                                <h1 className="text-3xl font-bold text-gray-800 mb-4">Processing Payment</h1>
                                <p className="text-gray-600 mb-2">Redirecting to Khalti...</p>
                                <p className="text-lg font-semibold text-gray-800">Rs. {total}</p>
                            </div>
                        )}

                        {/* Failed */}
                        {step === 'failed' && (
                            <div className="bg-white rounded-lg shadow-lg p-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-3xl">✕</span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
                                    <p className="text-gray-600">{error}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => navigate('/cart')}
                                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
                                    >
                                        Back to Cart
                                    </button>
                                    <button
                                        onClick={() => navigate('/payment', { state: { orderId, total } })}
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
