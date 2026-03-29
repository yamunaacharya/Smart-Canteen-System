import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/landing/navbar';
import Footer from '../components/landing/footer';
import { ArrowLeft, MapPin, Phone, Mail, Users, Utensils, Clock } from 'lucide-react';

export default function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <div className="flex-1 bg-violet-50">
                {/* Back Button */}
                <div className="pt-24 pb-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-8"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Home</span>
                        </button>
                    </div>
                </div>

                {/* Header Section */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            About Us
                        </h1>
                        <p className="text-xl text-gray-600">
                            Serving delicious food with quality and passion since day one
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        {/* Story Section */}
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Welcome to our Canteen! We're dedicated to providing quality food and exceptional service to our valued customers. With a passion for culinary excellence, we strive to create memorable dining experiences.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Our team works tirelessly to ensure every meal is prepared with fresh ingredients and attention to detail. Whether you're grabbing a quick bite or ordering your favorite meal, we're here to satisfy your cravings.
                            </p>
                        </div>

                        {/* Mission & Vision */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-lg p-8">
                                <h3 className="text-xl font-bold text-violet-600 mb-3 flex items-center gap-2">
                                    <Utensils className="w-6 h-6" />
                                    Our Mission
                                </h3>
                                <p className="text-gray-600">
                                    To deliver delicious, fresh food with exceptional customer service and maintain the highest standards of quality in everything we do.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-8">
                                <h3 className="text-xl font-bold text-purple-600 mb-3 flex items-center gap-2">
                                    <Users className="w-6 h-6" />
                                    Our Vision
                                </h3>
                                <p className="text-gray-600">
                                    To be the preferred food destination for students and professionals, known for quality, affordability, and excellent service.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Why Choose Us */}
                    <div className="bg-violet-600 rounded-lg shadow-lg p-8 mb-12 text-white">
                        <h2 className="text-2xl font-bold mb-8">Why Choose Us?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-20">
                                        <Utensils className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Fresh Food</h3>
                                    <p className="text-blue-100 mt-2">We use fresh ingredients prepared daily for quality meals</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-20">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Quick Service</h3>
                                    <p className="text-blue-100 mt-2">Fast and efficient service without compromising on quality</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-20">
                                        <Users className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Customer First</h3>
                                    <p className="text-blue-100 mt-2">Your satisfaction is our top priority, always</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8">Get in Touch</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-violet-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
                                    <p className="text-gray-600">
                                        123 Food Street<br />
                                        Itahari, Nepal
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Phone className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Phone</h3>
                                    <p className="text-gray-600">
                                        +977-980000000<br />
                                        Available 9AM - 9PM
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Mail className="w-6 h-6 text-violet-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
                                    <p className="text-gray-600">
                                        info@canteen.com<br />
                                        support@canteen.com
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => navigate('/menu')}
                            className="px-8 py-4 bg-violet-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-lg hover:bg-violet-700"
                        >
                            Order Now
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
