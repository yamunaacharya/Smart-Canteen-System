import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search } from 'lucide-react';
import Navbar from '../components/landing/navbar';
import Footer from '../components/landing/footer';
import api from '../services/api';

export default function Menu() {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState(null);

    // Fetch menu items from backend
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                const response = await api.get('/menu');
                setMenuItems(response.data || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching menu items:', err);
                setError('Failed to load menu items. Please try again later.');
                setMenuItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    const categories = [
        { id: 'all', name: 'All Items' },
        { id: 'food', name: 'Food' },
        { id: 'drinks', name: 'Drinks' },
        { id: 'snacks', name: 'Snacks' },
    ];

    // Filter menu items based on category and search
    const filteredItems = menuItems.filter(item => {
        const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
        const searchMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
    });

    // Handle add to cart - calls backend to decrease stock
    const handleAddToCart = async (item) => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Check if item is out of stock
        if (item.qty <= 0 || item.a_status === 'OUT_OF_STOCK') {
            showNotification(`${item.name} is out of stock!`, 'error');
            return;
        }

        try {
            // Call backend to decrease stock
            const response = await api.post(`/menu/${item.id}/add-to-cart`, { quantity: 1 });

            // Update local menu items to reflect new stock
            setMenuItems(prevItems => prevItems.map(menuItem =>
                menuItem.id === item.id
                    ? { ...menuItem, qty: response.data.item.qty, a_status: response.data.item.a_status }
                    : menuItem
            ));

            // Add to cart context
            addToCart(item);
            showNotification(`${item.name} added to cart!`);
        } catch (err) {
            console.error('Error adding to cart:', err);
            showNotification(err?.response?.data?.error || 'Failed to add item to cart', 'error');
        }
    };

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 2000);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="pt-24">
                    {/* Notification */}
                    {notification && (
                        <div className={`fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                            } text-white`}>
                            {notification.message}
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="mb-8">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search menu items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-8">
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${selectedCategory === category.id
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
                                            }`}
                                    >
                                        {category.icon} {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Menu Items Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-blue-600 to-purple-600"></div>
                            </div>
                        ) : filteredItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                    >
                                        {/* Image Container */}
                                        <div
                                            onClick={() => navigate(`/menu/${item.id}`)}
                                            className="relative overflow-hidden cursor-pointer"
                                            style={{ width: '100%', height: '12rem', backgroundColor: '#f3f4f6' }}
                                        >
                                            <img
                                                src={`http://localhost:3000${item.image}`}
                                                alt={item.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    display: 'block'
                                                }}
                                            />
                                            {/* Category Badge */}
                                            <div className="absolute bottom-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                                                {item.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {item.description}
                                            </p>

                                            {/* Price and Add to Cart */}
                                            <div className="flex justify-between items-center">
                                                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                    Rs. {item.price}
                                                </div>
                                                {item.qty <= 0 || item.a_status === 'OUT_OF_STOCK' ? (
                                                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium">
                                                        Out of Stock
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddToCart(item)}
                                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium shadow-md"
                                                    >
                                                        <ShoppingCart size={18} />
                                                        Order Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-gray-500 text-xl">No items found matching your search.</p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCategory('all');
                                    }}
                                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        {/* Login Prompt for Non-Registered Users */}
                        {!user && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 hidden">
                                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                                    <p className="text-lg font-semibold mb-4">Please log in to add items to cart</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
                                    >
                                        Go to Login
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
