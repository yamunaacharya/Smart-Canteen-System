import { useState } from 'react';
import { Upload, Trash2, Edit2, Plus } from 'lucide-react';
import axios from 'axios';

export default function MenuItems() {
    const [menuItems, setMenuItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        category: 'food',
        price: '',
        quantity: '1',
        description: '',
        image: null
    });

    const categories = [
        { id: 'food', name: 'Food' },
        { id: 'drinks', name: 'Drinks' },
        { id: 'snacks', name: 'Snacks' }
    ];

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            // Show preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.price || !formData.description) {
            showNotification('Please fill all required fields', 'error');
            return;
        }

        if (!editingId && !formData.image) {
            showNotification('Please upload an image', 'error');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('qty', formData.quantity);
            formDataToSend.append('description', formData.description);
            
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const url = editingId 
                ? `http://localhost:3000/api/menu/${editingId}`
                : 'http://localhost:3000/api/menu';

            const method = editingId ? 'PUT' : 'POST';

            const config = {
                method,
                url,
                data: formDataToSend,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            const response = await axios(config);

            if (editingId) {
                setMenuItems(menuItems.map(item => 
                    item.id === editingId ? response.data : item
                ));
                showNotification('Menu item updated successfully', 'success');
            } else {
                setMenuItems([...menuItems, response.data]);
                showNotification('Menu item added successfully', 'success');
            }

            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save menu item';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Edit item
    const handleEdit = (item) => {
        setFormData({
            name: item.name,
            category: item.category,
            price: item.price,
            description: item.description,
            image: null
        });
        setImagePreview(item.image);
        setEditingId(item.id);
        setShowForm(true);
    };

    // Delete item
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`http://localhost:3000/api/menu/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setMenuItems(menuItems.filter(item => item.id !== id));
                showNotification('Menu item deleted successfully', 'success');
            } catch (error) {
                showNotification('Failed to delete menu item', 'error');
            }
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            category: 'food',
            price: '',
            quantity: '1',
            description: '',
            image: null
        });
        setImagePreview(null);
        setEditingId(null);
    };

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Menu Items Management</h1>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                >
                    <Plus size={20} />
                    Add New Item
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`mb-6 p-4 rounded-lg ${
                    notification.type === 'success' 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                    {notification.message}
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Item Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Item Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Price (Rs.) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 299"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Quantity in Stock
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 10"
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Image {!editingId && '*'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Upload className="absolute right-3 top-2.5 text-gray-400" size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Image Preview
                                </label>
                                <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-300">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-all font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Menu Items List */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">Image</th>
                                <th className="px-6 py-4 text-left font-semibold">Name</th>
                                <th className="px-6 py-4 text-left font-semibold">Category</th>
                                <th className="px-6 py-4 text-left font-semibold">Price</th>
                                <th className="px-6 py-4 text-left font-semibold">Quantity</th>
                                <th className="px-6 py-4 text-left font-semibold">Description</th>
                                <th className="px-6 py-4 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.length > 0 ? (
                                menuItems.map((item, index) => (
                                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="px-6 py-4">
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">Rs. {item.price}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{item.qty || 1}</td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{item.description}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all font-medium"
                                                >
                                                    <Edit2 size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-medium"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <p className="text-lg font-semibold mb-2">No menu items yet</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
