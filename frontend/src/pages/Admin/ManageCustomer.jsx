import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './sidebar';

export default function ManageCustomer() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', email: '', password: '' });
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const activeTab = 'customers';

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch('http://localhost:3000/api/users/customers', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch customers');
            const data = await res.json();
            setCustomers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
        } catch (err) {
            alert(err.message);
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
        } catch (err) {
            alert(err.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar active={activeTab} />
            <div className="ml-64 flex-1">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-8 py-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Manage Customers
                            </h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* User Profile */}
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</span>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-8">

                    {/* Search Filter */}
                    <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative w-full md:max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search customers..."
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* <button className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 active:scale-95">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                        </button> */}
                    </div>

                    {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
                        error ? <div className="p-8 text-center text-red-500">{error}</div> : (
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 uppercase text-sm font-semibold">
                                            <tr>
                                                <th className="px-6 py-4">ID</th>
                                                <th className="px-6 py-4">Name</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Password reset</th>
                                                <th className="px-6 py-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredCustomers.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-gray-500">#{user.id}</td>

                                                    {editUser === user.id ? (
                                                        <>
                                                            <td className="px-6 py-4">
                                                                <input
                                                                    type="text"
                                                                    value={editFormData.name}
                                                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                                    className="bg-white text-gray-900 px-3 py-1 rounded border border-gray-300 focus:outline-none focus:border-indigo-500 w-full"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <input
                                                                    type="email"
                                                                    value={editFormData.email}
                                                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                                                    className="bg-white text-gray-900 px-3 py-1 rounded border border-gray-300 focus:outline-none focus:border-indigo-500 w-full"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <input
                                                                    type="password"
                                                                    placeholder="New password"
                                                                    value={editFormData.password}
                                                                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                                                    className="bg-white text-gray-900 px-3 py-1 rounded border border-gray-300 focus:outline-none focus:border-indigo-500 w-full"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-center space-x-2">
                                                                <button onClick={handleEditSave} className="text-green-600 hover:text-green-500 font-medium">Save</button>
                                                                <button onClick={handleEditCancel} className="text-gray-500 hover:text-gray-400 font-medium">Cancel</button>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                                            <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                                            <td className="px-6 py-4 text-gray-400 italic">Hidden</td>
                                                            <td className="px-6 py-4 text-center space-x-3">
                                                                <button
                                                                    onClick={() => handleEditClick(user)}
                                                                    className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(user.id)}
                                                                    className="text-red-600 hover:text-red-500 font-medium transition-colors"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                            {filteredCustomers.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                        No customers found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                </main>
            </div>
        </div>
    );
}



