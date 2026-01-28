import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown, User, ShoppingCart } from 'lucide-react';

import logo from '../../assets/logo.png';

export default function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsDropdownOpen(false);
    };

    const handleDashboard = () => {
        if (user?.role === 'ADMIN') {
            navigate('/admin/dashboard');
        } else {
            navigate('/customer/dashboard');
        }
        setIsDropdownOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    <Link to="/" className="flex items-center space-x-2">
                        <img src={logo} alt="Munchies & More" className="h-10 w-auto object-contain" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Munchies & More
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Home
                        </Link>
                        <Link to="/menu" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Menus
                        </Link>
                        <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            About
                        </Link>
                        <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Contact
                        </Link>
                    </div>


                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {user?.role === 'CUSTOMER' && (
                                    <Link to="/cart" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Cart">
                                        <ShoppingCart className="w-5 h-5 text-gray-700" />
                                    </Link>
                                )}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <User className="w-5 h-5 text-gray-700" />
                                        <span className="text-gray-700 font-medium">
                                            Wlc, {user.name}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-700" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                            <button
                                                onClick={handleDashboard}
                                                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium border-b border-gray-200"
                                            >
                                                Dashboard
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
