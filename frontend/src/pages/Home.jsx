import React from 'react'

export default function Home() {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome</h1>
        <p className="text-xl text-gray-600 mb-8">Get started with your account</p>
        
        <div className="flex gap-4 justify-center">
          <a
            href="/register"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-lg"
          >
            Log In
          </a>
        </div>
      </div>
    </div>
    </div>
  )
}
