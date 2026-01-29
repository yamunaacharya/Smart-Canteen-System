import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Navbar from '../components/landing/navbar';
import Footer from '../components/landing/footer';
import api from '../services/api';
import { useState } from 'react';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart, cartCount } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Handle remove item - restore stock
    const handleRemoveItem = async (item) => {
        try {
            await api.post(`/menu/${item.id}/remove-from-cart`, { quantity: item.quantity });
            showNotification(`${item.name} removed from cart`);
        } catch (err) {
            console.error('Error restoring stock:', err);
            // Even if backend fails (e.g. item not found), remove from cart
        } finally {
            removeFromCart(item.id);
        }
    };

    // Handle quantity update - restore or decrease stock
    const handleQuantityChange = async (item, newQuantity) => {
        if (newQuantity <= 0) {
            handleRemoveItem(item);
            return;
        }

        const diff = item.quantity - newQuantity;
        try {
            if (diff > 0) {
                // Decreasing quantity - restore stock
                await api.post(`/menu/${item.id}/remove-from-cart`, { quantity: diff });
            } else {
                // Increasing quantity - decrease stock
                await api.post(`/menu/${item.id}/add-to-cart`, { quantity: Math.abs(diff) });
            }
            updateQuantity(item.id, newQuantity);
        } catch (err) {
            console.error('Error updating quantity:', err);
            const errorMessage = err?.response?.data?.error || 'Failed to update quantity';

            // If it's a stock issue (increasing qty), don't update local state
            if (diff < 0) {
                showNotification(errorMessage, 'error');
                return;
            }

            // If it's decreasing qty (restoring stock) and fails, still allow local update
            updateQuantity(item.id, newQuantity);
            showNotification('Quantity updated (stock sync failed)', 'warning');
        }
    };

    // Handle clear cart - restore all stock
    const handleClearCart = async () => {
        try {
            for (const item of cart) {
                try {
                    await api.post(`/menu/${item.id}/remove-from-cart`, { quantity: item.quantity });
                } catch (e) {
                    console.error(`Failed to restore stock for ${item.name}`, e);
                }
            }
            clearCart();
            showNotification('Cart cleared');
        } catch (err) {
            console.error('Error clearing cart:', err);
            // Force clear even if something goes wrong
            clearCart();
        }
    };

    // Place order
    const handlePlaceOrder = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/orders', { items: cart });
            clearCart();
            showNotification('Order placed successfully!');
            setTimeout(() => navigate('/customer/dashboard'), 2000);
        } catch (err) {
            console.error('Error placing order:', err);
            showNotification(err?.response?.data?.error || 'Failed to place order', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="pt-24 pb-12">
                    {/* Notification */}
                    {notification && (
                        <div className={`fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                            } text-white`}>
                            {notification.message}
                        </div>
                    )}

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/menu')}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                                </button>
                                <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <ShoppingBag className="w-5 h-5" />
                                <span>{cartCount} items</span>
                            </div>
                        </div>

                        {cart.length === 0 ? (
                            /* Empty Cart */
                            <div className="text-center py-16">
                                <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
                                <button
                                    onClick={() => navigate('/menu')}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                                >
                                    Browse Menu
                                </button>
                            </div>
                        ) : (
                            /* Cart Items */
                            <div className="space-y-6">
                                {/* Items List */}
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    {cart.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center p-4 ${index !== cart.length - 1 ? 'border-b border-gray-100' : ''
                                                }`}
                                        >
                                            {/* Item Image */}
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img
                                                    src={`http://localhost:3000${item.image}`}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 ml-4">
                                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                <p className="text-sm text-gray-500">{item.category}</p>
                                                <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                    Rs. {item.price}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                                >
                                                    <Minus className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                                >
                                                    <Plus className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="w-24 text-right ml-4">
                                                <p className="font-bold text-gray-800">
                                                    Rs. {item.price * item.quantity}
                                                </p>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemoveItem(item)}
                                                className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary */}
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal ({cartCount} items)</span>
                                            <span>Rs. {total}</span>
                                        </div>
                                        <hr className="border-gray-200" />
                                        <div className="flex justify-between text-xl font-bold text-gray-800">
                                            <span>Total</span>
                                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                Rs. {total}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleClearCart}
                                            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            Clear Cart
                                        </button>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={loading}
                                            className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
                                        >
                                            {loading ? 'Placing Order...' : 'Place Order'}
                                        </button>
                                    </div>
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
