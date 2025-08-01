import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tailwind Test</h1>
        <p className="text-gray-600 mb-4">If you can see this styled properly, Tailwind is working!</p>
        <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
}
