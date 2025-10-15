import { useEffect, useState } from 'react';
import { Check, Crown, Zap, CreditCard, AlertCircle, Clock } from 'lucide-react';
import { auth, SubscriptionPlan, UserSubscription } from '../lib/auth';

export function SubscriptionModule() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansData, subscriptionData] = await Promise.all([
        auth.getSubscriptionPlans(),
        auth.getUserSubscription()
      ]);
      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    try {
      const priceId = billingCycle === 'monthly'
        ? plan.stripe_price_id_monthly
        : plan.stripe_price_id_yearly;

      if (!priceId) {
        alert('This plan is not available yet. Please contact support.');
        return;
      }

      await auth.createCheckoutSession(priceId, plan.id, billingCycle);
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(`Failed to start checkout: ${error.message || 'Please try again.'}`);
    }
  };

  const daysLeft = auth.getDaysLeftInTrial(currentSubscription);
  const isTrialExpired = auth.isTrialExpired(currentSubscription);

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Enterprise')) return Crown;
    if (planName.includes('Professional')) return Zap;
    return Check;
  };

  const getPlanColor = (planName: string) => {
    if (planName.includes('Enterprise')) return 'from-purple-600 to-pink-600';
    if (planName.includes('Professional')) return 'from-blue-600 to-cyan-600';
    return 'from-slate-600 to-slate-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Subscription & Billing</h1>
        <p className="text-slate-600">Manage your SupplyVision subscription</p>
      </div>

      {currentSubscription?.status === 'trial' && (
        <div className={`rounded-xl p-6 border-2 ${
          isTrialExpired
            ? 'bg-red-50 border-red-200'
            : daysLeft <= 3
            ? 'bg-amber-50 border-amber-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${
              isTrialExpired
                ? 'bg-red-100'
                : daysLeft <= 3
                ? 'bg-amber-100'
                : 'bg-blue-100'
            }`}>
              <Clock className={`w-6 h-6 ${
                isTrialExpired
                  ? 'text-red-600'
                  : daysLeft <= 3
                  ? 'text-amber-600'
                  : 'text-blue-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${
                isTrialExpired
                  ? 'text-red-900'
                  : daysLeft <= 3
                  ? 'text-amber-900'
                  : 'text-blue-900'
              }`}>
                {isTrialExpired
                  ? 'Trial Expired'
                  : daysLeft === 1
                  ? '1 Day Left in Trial'
                  : `${daysLeft} Days Left in Trial`
                }
              </h3>
              <p className={`text-sm ${
                isTrialExpired
                  ? 'text-red-700'
                  : daysLeft <= 3
                  ? 'text-amber-700'
                  : 'text-blue-700'
              }`}>
                {isTrialExpired
                  ? 'Your trial has ended. Upgrade to continue using SupplyVision.'
                  : 'Upgrade to a paid plan to continue after your trial ends.'
                }
              </p>
              {!isTrialExpired && (
                <p className="text-xs mt-2 opacity-75">
                  Trial ends: {new Date(currentSubscription.trial_ends_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Choose Your Plan</h2>
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const isCurrentPlan = currentSubscription?.plan_id === plan.id;
            const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
            const isPro = plan.name.includes('Professional');

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-6 transition-all ${
                  isPro
                    ? 'border-blue-500 shadow-lg scale-105'
                    : isCurrentPlan
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                    Current Plan
                  </div>
                )}

                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${getPlanColor(plan.name)} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>

                <div className="mb-4">
                  {plan.price_monthly === 0 ? (
                    <div className="text-3xl font-bold text-slate-900">Free</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900">${price}</span>
                      <span className="text-slate-600">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                  )}
                  {billingCycle === 'yearly' && price > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      ${(price / 12).toFixed(0)}/month billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {(plan.features as string[]).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium cursor-not-allowed opacity-75"
                  >
                    Current Plan
                  </button>
                ) : plan.price_monthly === 0 ? (
                  <button
                    disabled
                    className="w-full py-3 bg-slate-200 text-slate-500 rounded-lg font-medium cursor-not-allowed"
                  >
                    Trial Active
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      isPro
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    Upgrade to {plan.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">Secure Payment Processing</h3>
            <p className="text-sm text-slate-700">
              All payments are securely processed through Stripe. Your payment information is encrypted and never stored on our servers. Cancel anytime with no hidden fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
