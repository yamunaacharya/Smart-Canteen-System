import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Save, X } from 'lucide-react';

export default function ManageCustomer() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', email: '', password: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('customers');
    const [notification, setNotification] = useState(null);

    const navigate = useNavigate();
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                setLoading(false);
                navigate('/login');
                return;
            }

            const res = await fetch('http://localhost:3000/api/users/customers', {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server did not return JSON');
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(
                    errorData.message || 
                    errorData.error || 
                    `HTTP ${res.status}: Failed to fetch customers`
                );
            }
            
            const data = await res.json();
            setCustomers(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError(err.message || 'Failed to load customers. Please check your connection and permissions.');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete user');
            setCustomers(customers.filter(c => c.id !== id));
            showNotification('Customer deleted successfully', 'success');
        } catch (err) {
            showNotification(err.message || 'Failed to delete customer', 'error');
        }
    };

    const handleEditClick = (user) => {
        setEditUser(user.id);
        setEditFormData({ name: user.name, email: user.email, password: '' });
    };

    const handleEditCancel = () => {
        setEditUser(null);
        setEditFormData({ name: '', email: '', password: '' });
    };

    const handleEditSave = async () => {
        if (!editFormData.name || !editFormData.email) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/users/${editUser}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editFormData)
            });

            if (!res.ok) throw new Error('Failed to update user');
            const updatedUser = await res.json();

            setCustomers(customers.map(c => c.id === editUser ? { ...c, ...updatedUser } : c));
            handleEditCancel();
            showNotification('Customer updated successfully', 'success');
        } catch (err) {
            showNotification(err.message || 'Failed to update customer', 'error');
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <main className="p-8">
                    {notification && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                            notification.type === 'success' 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                            {notification.type === 'success' ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                                </svg>
                            )}
                            {notification.message}
                        </div>
                    )}

                    {/* Search Filter */}
                    <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative w-full md:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <div className="inline-block">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-gray-600 font-medium">Loading customers...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                            <h3 className="font-semibold mb-2">Error loading customers</h3>
                            <p className="text-sm mb-4">{error}</p>
                            <button
                                onClick={fetchCustomers}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                            {filteredCustomers.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <div className="inline-block">
                                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3.662a1.97 1.97 0 01-1.97-2.119A17.995 17.995 0 0112 2.75c.95 0 1.884.086 2.799.25A1.97 1.97 0 0112 21z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-medium">No customers found</p>
                                    {searchQuery && <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4">ID</th>
                                                <th className="px-6 py-4">Name</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Role</th>
                                                <th className="px-6 py-4">Joined</th>
                                                <th className="px-6 py-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredCustomers.map((customer, index) => (
                                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                                    {editUser === customer.id ? (
                                                        <>
                                                            <td className="px-6 py-4 text-gray-600">#{customer.id}</td>
                                                            <td className="px-6 py-4">
                                                                <input
                                                                    type="text"
                                                                    value={editFormData.name}
                                                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg bg-indigo-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                                    placeholder="Customer name"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <input
                                                                    type="email"
                                                                    value={editFormData.email}
                                                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                                                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg bg-indigo-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                                    placeholder="Email address"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                                    {customer.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <input
                                                                    type="password"
                                                                    value={editFormData.password}
                                                                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                                                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg bg-indigo-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                                    placeholder="New password (optional)"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex gap-2 justify-center">
                                                                    <button
                                                                        onClick={handleEditSave}
                                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium text-sm"
                                                                        title="Save changes"
                                                                    >
                                                                        <Save size={16} />
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={handleEditCancel}
                                                                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all font-medium text-sm"
                                                                        title="Cancel editing"
                                                                    >
                                                                        <X size={16} />
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-6 py-4 text-gray-600">#{customer.id}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-semibold text-gray-900">{customer.name}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                                    {customer.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600 text-sm">
                                                                {new Date(customer.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex gap-2 justify-center">
                                                                    <button
                                                                        onClick={() => handleEditClick(customer)}
                                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium text-sm"
                                                                        title="Edit customer"
                                                                    >
                                                                        <Edit2 size={16} />
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(customer.id)}
                                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium text-sm"
                                                                        title="Delete customer"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
    
    );
}
