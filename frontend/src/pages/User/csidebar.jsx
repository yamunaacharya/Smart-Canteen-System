import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SidebarItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-6 py-3 transition-colors ${active
                ? 'bg-indigo-600 text-white border-l-4 border-indigo-400'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );
}

export default function CustomerSidebar({ activeTab, setActiveTab }) {
    const navigate = useNavigate();

    return (
        <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed h-full shadow-xl">
            {/* Logo/Title */}
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-xl font-bold">Customer Dashboard</h1>
            </div>

            {/* Navigation */}
            <nav className="mt-6">
                <SidebarItem
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    }
                    label="Dashboard"
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                />
                <SidebarItem
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    }
                    label="Orders"
                    active={activeTab === 'orders'}
                    onClick={() => setActiveTab('orders')}
                />
                <SidebarItem
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                    label="Profile"
                    active={activeTab === 'profile'}
                    onClick={() => navigate('/customer/profile')}
                />
                <SidebarItem
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                    label="Settings"
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                />
            </nav>
        </aside>
    );
}
