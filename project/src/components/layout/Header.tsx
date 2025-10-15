import React from 'react';
import { Package, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useSubscription } from '../../hooks/useSubscription';

export function Header() {
  const { user, signOut } = useAuth();
  const { subscription, loading } = useSubscription();

  const getPlanName = () => {
    if (loading) return 'Loading...';
    if (!subscription?.price_id) return 'Free Trial';
    
    // Map price IDs to plan names
    const planMap: Record<string, string> = {
      'price_1SHztnLZmi0FJLwyNoxg7489': 'Basic',
      'price_1SHzv5LZmi0FJLwynncUasUe': 'Professional',
      'price_1SHzw4LZmi0FJLwyTx2dm2zM': 'Enterprise',
    };
    
    return planMap[subscription.price_id] || 'Unknown Plan';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-indigo-600" />
            <h1 className="ml-2 text-xl font-semibold text-gray-900">SupplyVision</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Plan:</span>
                  <span className="text-sm font-medium text-indigo-600">
                    {getPlanName()}
                  </span>
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Bell className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                
                <button
                  onClick={signOut}
                  className="p-2 text-gray-400 hover:text-gray-500"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}