import React from 'react';
import { BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  user: any;
}

export function Header({ user }: HeaderProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">SupplyVision</h1>
        </div>
        
        {user && (
          <UserMenu user={user} onSignOut={handleSignOut} />
        )}
      </div>
    </header>
  );
}