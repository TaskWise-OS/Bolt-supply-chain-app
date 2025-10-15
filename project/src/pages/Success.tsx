import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { STRIPE_PRODUCTS } from '../stripe-config';

export function Success() {
  const [searchParams] = useSearchParams();
  const [planName, setPlanName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      fetchSessionDetails(sessionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      // In a real implementation, you'd fetch session details from your backend
      // For now, we'll check the user's current subscription
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: subscription } = await supabase
          .from('stripe_user_subscriptions')
          .select('price_id')
          .eq('customer_id', user.id)
          .single();

        if (subscription) {
          const product = STRIPE_PRODUCTS.find(p => p.priceId === subscription.price_id);
          setPlanName(product?.name || 'Your Plan');
        }
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Welcome to {planName || 'SupplyVision'}! Your subscription is now active.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">What's Next?</h2>
          <ul className="text-sm text-gray-600 space-y-1 text-left">
            <li>• Access your dashboard to start managing inventory</li>
            <li>• Set up your warehouses and products</li>
            <li>• Configure alerts and notifications</li>
            <li>• Explore AI-powered forecasting features</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          
          <Link
            to="/"
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          You'll receive a confirmation email shortly with your receipt and subscription details.
        </p>
      </div>
    </div>
  );
}