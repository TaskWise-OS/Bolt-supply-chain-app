import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly: string;
  stripe_price_id_yearly: string;
  features: string[];
  max_products: number;
  max_warehouses: number;
  max_users: number;
  is_active: boolean;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  trial_ends_at: string;
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  subscription_plans?: SubscriptionPlan;
}

export const auth = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Free Trial')
        .maybeSingle();

      if (plans) {
        await supabase.from('user_subscriptions').insert({
          user_id: data.user.id,
          plan_id: plans.id,
          status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getUserSubscription(): Promise<UserSubscription | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user as AuthUser | null);
    });
  },

  isTrialExpired(subscription: UserSubscription | null): boolean {
    if (!subscription) return false;
    if (subscription.status !== 'trial') return false;
    return new Date(subscription.trial_ends_at) < new Date();
  },

  getDaysLeftInTrial(subscription: UserSubscription | null): number {
    if (!subscription || subscription.status !== 'trial') return 0;
    const daysLeft = Math.ceil(
      (new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, daysLeft);
  },

  async createCheckoutSession(priceId: string, planId: string, billingCycle: 'monthly' | 'yearly') {
    const user = await this.getCurrentUser();
    const subscription = await this.getUserSubscription();

    if (!user || !subscription) {
      throw new Error('User not authenticated');
    }

    let customerId = subscription.stripe_customer_id;

    if (!customerId) {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-customer`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create customer');
      }

      const data = await response.json();
      customerId = data.customerId;
    }

    const checkoutResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerId,
          userId: user.id,
          successUrl: `${window.location.origin}/?success=true`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
        }),
      }
    );

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { url } = await checkoutResponse.json();
    window.location.href = url;
  },
};
