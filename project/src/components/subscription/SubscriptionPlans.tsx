import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { stripeProducts } from '../../stripe-config';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
  priceId: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Basic',
    price: 'A$49',
    description: 'Basic supply chain monitoring',
    features: [
      'Basic inventory tracking',
      'Simple reporting',
      'Email support',
      'Up to 100 products',
      '2 warehouses',
    ],
    priceId: 'price_1SHztnLZmi0FJLwyNoxg7489',
  },
  {
    name: 'Professional',
    price: 'A$149',
    description: 'Advanced analytics and forecasting',
    features: [
      'Advanced inventory management',
      'AI-powered forecasting',
      'Custom alerts',
      'Priority support',
      'Up to 1,000 products',
      '10 warehouses',
      'API access',
    ],
    priceId: 'price_1SHzv5LZmi0FJLwynncUasUe',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'A$399',
    description: 'Full AI-powered supply chain optimisation',
    features: [
      'Everything in Professional',
      'Advanced AI & ML models',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 premium support',
      'Unlimited products & warehouses',
      'White-label options',
    ],
    priceId: 'price_1SHzw4LZmi0FJLwyTx2dm2zM',
  },
];

export function SubscriptionPlans() {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoading(priceId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/pricing`,
          mode: 'subscription',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Select the perfect plan for your supply chain needs
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? 'border-indigo-500 shadow-lg scale-105'
                  : 'border-gray-200 shadow-sm'
              } bg-white p-8`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading === plan.priceId}
                className={`mt-8 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
              >
                {loading === plan.priceId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Get Started'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}