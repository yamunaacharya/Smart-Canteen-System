import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Navbar from '../components/landing/navbar';
import Footer from '../components/landing/footer';
import api from '../services/api';

export default function SingleItemPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [notification, setNotification] = useState(null);

    // Fetch single item details
    useEffect(() => {
        const fetchItem = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/menu/${id}`);
                setItem(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching item:', err);
                setError('Failed to load product details. Please try again later.');
                setItem(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchItem();
        }
    }, [id]);

    // Show notification
    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 2000);
    };

    // Handle add to cart
    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (item) {
            showNotification(`${item.name} added to cart!`);
            setQuantity(1);
        }
    };

    // Handle quantity change
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0) {
            setQuantity(value);
        }
    };

    // Increment quantity
    const incrementQuantity = () => {
        setQuantity(quantity + 1);
    };

    // Decrement quantity
    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-blue-600 to-purple-600"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500 text-xl mb-6">{error || 'Product not found'}</p>
                        <button
                            onClick={() => navigate('/menu')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                        >
                            Back to Menu
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-8">
                {/* Notification */}
                {notification && (
                    <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse z-50">
                        {notification}
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Menu
                    </button>

                    {/* Product Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Image Section */}
                        <div className="flex items-center justify-center">
                            <div className="relative w-full bg-white rounded-xl shadow-lg overflow-hidden" style={{ maxWidth: '500px', aspectRatio: '1' }}>
                                <img
                                    src={`http://localhost:3000${item.image}`}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Category Badge */}
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold">
                                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="flex flex-col justify-center space-y-6">
                            {/* Product Name */}
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    {item.name}
                                </h1>
                            </div>


                            {/* Price */}
                            <div className="py-4 border-y border-gray-200">
                                <div className="text-4xl font-semibold text-black">
                                    Rs. {item.price}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-3">
                                  Description
                                </h2>
                                <p className="text-gray-600 text-base leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-2 gap-4 py-4 bg-gray-50 rounded-lg p-4">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Category</p>
                                    <p className="text-gray-900 font-bold">
                                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Availability</p>
                                    <p className="text-gray-900 font-bold text-green-600">In Stock</p>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center gap-4">
                                <span className="text-gray-700 font-medium">Quantity:</span>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={decrementQuantity}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        min="1"
                                        className="w-16 text-center border-l border-r border-gray-300 py-2 focus:outline-none"
                                    />
                                    <button
                                        onClick={incrementQuantity}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 transition-all font-bold text-lg shadow-md transform hover:-translate-y-0.5"
                            >
                                <ShoppingCart size={24} />
                                Order Now
                            </button>

                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
