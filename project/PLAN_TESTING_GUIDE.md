# Plan Testing & Subscription Guide

## ✅ Your App is Already Connected to Supabase

**YES!** Everything is already set up:
- ✓ Supabase connection configured
- ✓ Authentication working (email/password)
- ✓ Database storing all data
- ✓ Stripe integration ready
- ✓ Edge functions deployed for webhooks

**What's Stored in Supabase:**
- User accounts (email, password)
- Customer data
- Subscription status
- Payment information
- All inventory, products, warehouses, forecasts, alerts

## 📊 Subscription Tiers

### Free Trial
**Limits:**
- 50 products max
- 2 warehouses max
- 10 forecasts max

**Features:**
- ✅ Basic inventory tracking
- ✅ AI Demand Forecasting
- ✅ Predictive Alerts
- ✅ Export capabilities
- ❌ Scenario Planning
- ❌ Import capabilities
- ❌ Advanced Analytics
- ❌ Multi-carrier Optimization

### SupplyVision Basic (A$49/month)
**Limits:**
- 50 products max
- 2 warehouses max
- 10 forecasts max

**Features:**
- ✅ Basic inventory tracking
- ✅ Export capabilities
- ❌ AI Forecasting
- ❌ Scenario Planning
- ❌ Predictive Alerts
- ❌ Import capabilities
- ❌ Advanced Analytics

### SupplyVision Professional (A$149/month)
**Limits:**
- 500 products max
- 10 warehouses max
- 100 forecasts max

**Features:**
- ✅ ALL Free Trial features
- ✅ AI Demand Forecasting
- ✅ Scenario Planning
- ✅ Predictive Alerts
- ✅ Advanced Analytics
- ✅ Import capabilities
- ❌ Multi-carrier Optimization

### SupplyVision Enterprise (A$399/month)
**Limits:**
- ∞ Unlimited products
- ∞ Unlimited warehouses
- ∞ Unlimited forecasts

**Features:**
- ✅ ALL Professional features
- ✅ Multi-carrier Logistics Optimization
- ✅ Priority support
- ✅ Custom integrations

## 🧪 How to Test Different Plans

### Method 1: Visual Testing (Already Active)
1. **Look at bottom-right corner** of your screen when logged in
2. You'll see a **Plan Tester widget** showing:
   - Current plan name
   - Feature limits
   - Available features (✅ or ❌)

### Method 2: Database Testing
To change plans manually in Supabase:

1. Go to Supabase Dashboard: https://xtqtcvjkibkfqrkikoly.supabase.co
2. Navigate to **Table Editor** → `stripe_user_subscriptions`
3. Find your user's row
4. Update the `price_id` field:
   - **Basic**: `price_1SHztnLZmi0FJLwyNoxg7489`
   - **Professional**: `price_1SHzv5LZmi0FJLwynncUasUe`
   - **Enterprise**: `price_1SHzw4LZmi0FJLwyTx2dm2zM`
5. Set `subscription_status` to `'active'`
6. Refresh your app

### Method 3: Stripe Testing
1. Go to `/pricing` page in your app
2. Click "Subscribe" on any plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Any future date, any CVC
5. Complete checkout

## 🔒 What Features Are Gated

### AI Demand Forecasting
- **Required Plan:** Professional or Enterprise
- **Location:** `/forecasting` page
- **What happens:** Shows upgrade prompt if on Basic plan

### Scenario Planning
- **Required Plan:** Professional or Enterprise
- **Location:** `/scenarios` page - Play buttons
- **What happens:** Shows upgrade prompt or blocks action

### Import Data
- **Required Plan:** Professional or Enterprise
- **Location:** Inventory page "Import" button
- **What happens:** Shows upgrade prompt before import

### Product Limits
- **Basic/Free Trial:** Max 50 products
- **Professional:** Max 500 products
- **Enterprise:** Unlimited
- **What happens:** Shows limit reached message when trying to add more

### Warehouse Limits
- **Basic/Free Trial:** Max 2 warehouses
- **Professional:** Max 10 warehouses
- **Enterprise:** Unlimited

## 🎯 Testing Checklist

Test each plan by:

1. **Switch to Basic Plan**
   - ✓ Can add up to 50 products
   - ✓ Can export data
   - ✗ Cannot access AI forecasting (shows upgrade)
   - ✗ Cannot run scenarios (shows upgrade)
   - ✗ Cannot import data (shows upgrade)

2. **Switch to Professional Plan**
   - ✓ Can add up to 500 products
   - ✓ Can access AI forecasting
   - ✓ Can run scenarios
   - ✓ Can import data
   - ✓ Can use predictive alerts
   - ✗ No multi-carrier optimization

3. **Switch to Enterprise Plan**
   - ✓ Unlimited everything
   - ✓ All features unlocked
   - ✓ Multi-carrier optimization

## 💳 Stripe Configuration Status

**Current Status:** Stripe products are configured but keys need to be added to environment variables.

**To fully enable payments:**
1. Add to `.env` file:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

2. The app will automatically use these for checkout

**Without Stripe keys:** The feature gating still works, you just need to manually update the database to test different plans.

## 📱 Where to See Plan Information

1. **Bottom-right widget** - Always visible when logged in
2. **Pricing page** (`/pricing`) - Shows all plans and current plan
3. **Upgrade prompts** - Shown when accessing locked features
4. **Header** - Could add plan badge (not implemented yet)

## 🔄 Current Plan Detection

The app automatically:
- Checks your subscription status from Supabase
- Loads the appropriate feature limits
- Shows/hides features based on your plan
- Displays upgrade prompts when needed

No manual configuration needed after setting up subscription!
