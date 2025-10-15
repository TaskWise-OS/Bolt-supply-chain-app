/*
  # Subscription and Authentication System

  ## Overview
  Adds user authentication, subscription plans, and trial management for SupplyVision.
  Enables 14-day free trial with Stripe payment integration.

  ## New Tables

  ### 1. subscription_plans
  - `id` (uuid, primary key)
  - `name` (text) - Plan name (Free Trial, Professional, Enterprise)
  - `price_monthly` (numeric) - Monthly price in USD
  - `price_yearly` (numeric) - Annual price in USD
  - `stripe_price_id_monthly` (text) - Stripe Price ID for monthly billing
  - `stripe_price_id_yearly` (text) - Stripe Price ID for yearly billing
  - `features` (jsonb) - Plan features list
  - `max_products` (integer) - Maximum products allowed
  - `max_warehouses` (integer) - Maximum warehouses allowed
  - `max_users` (integer) - Maximum users allowed
  - `is_active` (boolean) - Plan availability
  - `created_at` (timestamptz)

  ### 2. user_subscriptions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - Supabase Auth user
  - `plan_id` (uuid, foreign key) - Current plan
  - `status` (text) - trial/active/cancelled/expired
  - `trial_ends_at` (timestamptz) - Trial expiration date
  - `current_period_start` (timestamptz) - Billing period start
  - `current_period_end` (timestamptz) - Billing period end
  - `stripe_customer_id` (text) - Stripe customer ID
  - `stripe_subscription_id` (text) - Stripe subscription ID
  - `cancelled_at` (timestamptz) - Cancellation date
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. payment_history
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `subscription_id` (uuid, foreign key)
  - `amount` (numeric) - Payment amount
  - `currency` (text) - Currency code
  - `status` (text) - succeeded/failed/pending
  - `stripe_payment_intent_id` (text)
  - `stripe_invoice_id` (text)
  - `paid_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own subscription data
  - Payment history restricted to subscription owner
*/

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_monthly numeric DEFAULT 0,
  price_yearly numeric DEFAULT 0,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  features jsonb DEFAULT '[]',
  max_products integer DEFAULT 100,
  max_warehouses integer DEFAULT 5,
  max_users integer DEFAULT 3,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE SET NULL,
  status text DEFAULT 'trial',
  trial_ends_at timestamptz DEFAULT now() + interval '14 days',
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT now() + interval '1 month',
  stripe_customer_id text,
  stripe_subscription_id text,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Payment History
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending',
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Public read access for subscription plans
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own payment history
CREATE POLICY "Users can view own payment history"
  ON payment_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, price_yearly, features, max_products, max_warehouses, max_users, is_active) VALUES
(
  'Free Trial',
  0,
  0,
  '["14-day free trial", "Up to 50 products", "2 warehouses", "Basic forecasting", "Email support"]'::jsonb,
  50,
  2,
  1,
  true
),
(
  'Professional',
  199,
  1990,
  '["Unlimited products", "Up to 10 warehouses", "Advanced AI forecasting", "Scenario simulation", "Priority support", "Custom alerts", "API access"]'::jsonb,
  999999,
  10,
  5,
  true
),
(
  'Enterprise',
  499,
  4990,
  '["Unlimited everything", "Unlimited warehouses", "Advanced AI & ML models", "Custom integrations", "Dedicated account manager", "24/7 premium support", "SLA guarantee", "White-label options"]'::jsonb,
  999999,
  999999,
  50,
  true
)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();