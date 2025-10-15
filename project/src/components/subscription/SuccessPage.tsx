import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SuccessPage() {
  useEffect(() => {
    // Clear any checkout-related data from localStorage
    localStorage.removeItem('checkout_session_id');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to SupplyVision!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your subscription has been successfully activated. You now have access to all the features of your selected plan.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            to="/inventory"
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Start Managing Inventory
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Next steps:</strong> Set up your warehouses, add products, and start optimizing your supply chain with AI-powered insights.
          </p>
        </div>
      </div>
    </div>
  );
}