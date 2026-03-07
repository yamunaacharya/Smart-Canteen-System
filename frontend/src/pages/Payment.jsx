import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/landing/navbar';
import Footer from '../components/landing/footer';
import { Loader } from 'lucide-react';

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { orderId, total } = location.state || {};
    const [isRedirecting, setIsRedirecting] = useState(true);

    useEffect(() => {
        if (!orderId) {
            navigate('/cart');
            return;
        }

        // Auto-redirect to Khalti payment since it's the only payment method
        if (user && orderId && total) {
            setIsRedirecting(true);
            navigate('/khalti-payment', { state: { orderId, total } });
        }
    }, [orderId, total, user, navigate]);

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
                        <div className="text-center">
                            <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">Processing Payment</h1>
                            <p className="text-gray-600">Redirecting to payment gateway...</p>
                            <p className="text-lg font-semibold text-gray-800 mt-4">Rs. {total}</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
