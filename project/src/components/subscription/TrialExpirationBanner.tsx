import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function TrialExpirationBanner() {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkTrialStatus();
  }, []);

  const checkTrialStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: subscription } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, current_period_end')
        .maybeSingle();

      if (!subscription || subscription.subscription_status !== 'active') {
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('status, trial_ends_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (userSub && userSub.status === 'trial' && userSub.trial_ends_at) {
          const trialEnd = new Date(userSub.trial_ends_at);
          const now = new Date();
          const diffTime = trialEnd.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 0) {
            setIsExpired(true);
            setDaysRemaining(0);
          } else if (diffDays <= 7) {
            setDaysRemaining(diffDays);
          }
        }
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || dismissed || (daysRemaining === null && !isExpired)) {
    return null;
  }

  if (isExpired) {
    return (
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-red-800">
                <AlertTriangle className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <p className="ml-3 font-medium truncate">
                <span className="md:hidden">Your trial has expired!</span>
                <span className="hidden md:inline">
                  Your free trial has expired. Upgrade now to continue using all features.
                </span>
              </p>
            </div>
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <button
                onClick={() => navigate('/pricing')}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50"
              >
                Upgrade Now
              </button>
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="-mr-1 flex p-2 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-500 text-white">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-yellow-600">
              <AlertTriangle className="h-6 w-6 text-white" aria-hidden="true" />
            </span>
            <p className="ml-3 font-medium truncate">
              <span className="md:hidden">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left in trial
              </span>
              <span className="hidden md:inline">
                Your free trial expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}.
                Upgrade now to keep all features.
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-600 bg-white hover:bg-yellow-50"
            >
              View Plans
            </button>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="-mr-1 flex p-2 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
