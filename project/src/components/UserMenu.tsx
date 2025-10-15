import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { STRIPE_PRODUCTS } from '../stripe-config';

interface UserMenuProps {
  user: any;
  onSignOut: () => void;
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('Free Trial');

  useEffect(() => {
    getCurrentPlan();
  }, []);

  const getCurrentPlan = async () => {
    try {
      const { data: subscription } = await supabase
        .from('stripe_user_subscriptions')
        .select('price_id, subscription_status')
        .eq('customer_id', user.id)
        .single();

      if (subscription && subscription.subscription_status === 'active') {
        const product = STRIPE_PRODUCTS.find(p => p.priceId === subscription.price_id);
        setCurrentPlan(product?.name || 'Active Plan');
      }
    } catch (error) {
      // User might not have a subscription yet
      setCurrentPlan('Free Trial');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {user.email}
          </div>
          <div className="text-xs text-gray-500">
            {currentPlan}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">{user.email}</div>
            <div className="text-xs text-gray-500">{currentPlan}</div>
          </div>
          
          <a
            href="/pricing"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <CreditCard className="w-4 h-4 mr-3" />
            Manage Subscription
          </a>
          
          <button
            onClick={() => {
              setIsOpen(false);
              // Add settings functionality here
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </button>
          
          <button
            onClick={() => {
              setIsOpen(false);
              onSignOut();
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}