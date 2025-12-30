import { Link } from 'react-router-dom';
import { useState } from 'react';

import logo from '../../assets/logo.png';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Home
                        </Link>
                        <Link to="/features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Features
                        </Link>
                        <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            About
                        </Link>
                        <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Contact
                        </Link>
                    </div>

                    
                    <div className="hidden md:flex items-center space-x-4">
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
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col space-y-4">
                            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                Home
                            </Link>
                            <Link to="/features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                Features
                            </Link>
                            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                About
                            </Link>
                            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                Contact
                            </Link>
                            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-center text-gray-700 hover:text-blue-600 transition-colors font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-center font-medium"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
