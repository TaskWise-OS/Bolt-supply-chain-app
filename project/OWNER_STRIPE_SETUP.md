# Stripe Setup Guide for SupplyVision App Owner

This guide will help you, as the app owner, set up Stripe to accept payments from your customers.

---

## 🎯 Overview

Your app is now fully integrated with Stripe! Customers can:
- Sign up for a 14-day free trial
- Upgrade to Professional ($199/month or $1,990/year)
- Upgrade to Enterprise ($499/month or $4,990/year)
- Pay securely through Stripe Checkout

**You just need to complete 5 simple steps to activate payments.**

---

## Step 1: Create Your Stripe Account (5 minutes)

1. Go to https://dashboard.stripe.com/register
2. Sign up with your business email
3. Complete the account verification
4. Activate your account (you'll need business details and bank info)

**💡 Tip:** Start with Test Mode to try everything before going live.

---

## Step 2: Get Your Stripe API Keys (2 minutes)

### For Testing (Test Mode)
1. In Stripe Dashboard, click **Developers** → **API keys**
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) ⚠️ Keep this secret!

### For Production (Live Mode)
1. Toggle to **Live mode** in the top right
2. Copy the live keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`) ⚠️ Keep this secret!

---

## Step 3: Create Your Products in Stripe (10 minutes)

### Create Professional Plan

1. In Stripe Dashboard, go to **Products** → **Add Product**
2. Fill in:
   - **Name:** SupplyVision Professional
   - **Description:** Advanced AI-powered supply chain management platform
   - **Image:** Upload your product image (optional)

3. **Add Monthly Price:**
   - Click **Add another price**
   - Pricing model: **Standard pricing**
   - Price: **$199.00 USD**
   - Billing period: **Monthly**
   - Click **Save**
   - **Copy the Price ID** (looks like `price_1AbCdEfGhIjKlMnO`)

4. **Add Yearly Price:**
   - Click **Add another price**
   - Price: **$1,990.00 USD**
   - Billing period: **Yearly**
   - Click **Save**
   - **Copy the Price ID**

### Create Enterprise Plan

1. Go to **Products** → **Add Product**
2. Fill in:
   - **Name:** SupplyVision Enterprise
   - **Description:** Enterprise-grade supply chain platform with unlimited features

3. **Add Monthly Price:**
   - Price: **$499.00 USD**
   - Billing period: **Monthly**
   - **Copy the Price ID**

4. **Add Yearly Price:**
   - Price: **$4,990.00 USD**
   - Billing period: **Yearly**
   - **Copy the Price ID**

---

## Step 4: Update Your Database with Price IDs (3 minutes)

1. Open your **Supabase Dashboard** → **SQL Editor**
2. Run this SQL (replace `price_xxxxx` with your actual Price IDs):

```sql
-- Update Professional Plan
UPDATE subscription_plans
SET
  stripe_price_id_monthly = 'price_xxxxx',  -- Your Professional monthly Price ID
  stripe_price_id_yearly = 'price_xxxxx'    -- Your Professional yearly Price ID
WHERE name = 'Professional';

-- Update Enterprise Plan
UPDATE subscription_plans
SET
  stripe_price_id_monthly = 'price_xxxxx',  -- Your Enterprise monthly Price ID
  stripe_price_id_yearly = 'price_xxxxx'    -- Your Enterprise yearly Price ID
WHERE name = 'Enterprise';

-- Verify the update
SELECT name, stripe_price_id_monthly, stripe_price_id_yearly
FROM subscription_plans
WHERE name IN ('Professional', 'Enterprise');
```

---

## Step 5: Deploy Edge Functions & Set Secrets (10 minutes)

### A. Set Stripe Secret in Supabase

You need to add your Stripe secret key as an environment variable in Supabase.

**Option 1: Via Supabase Dashboard (Recommended)**

1. Go to your **Supabase Dashboard**
2. Navigate to **Project Settings** → **Edge Functions**
3. Scroll to **Secrets**
4. Click **Add new secret**
5. Add:
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
6. Click **Save**

**Option 2: Via Supabase CLI**

If you have Supabase CLI installed:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### B. Deploy the Edge Functions

The Edge Functions are already created in your project. You need to deploy them:

**Using the MCP Supabase Tool (if available):**

The functions will be deployed automatically through the Supabase integration.

**Manual Deployment (if needed):**

If you have Supabase CLI installed:
```bash
cd supabase/functions

# Deploy customer creation function
supabase functions deploy create-customer

# Deploy checkout session function
supabase functions deploy create-checkout-session

# Deploy webhook handler
supabase functions deploy stripe-webhook
```

### C. Set Up Stripe Webhook (Required for Production)

Webhooks notify your app when payments succeed or fail.

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://[your-project-ref].supabase.co/functions/v1/stripe-webhook
   ```
   Replace `[your-project-ref]` with your actual Supabase project reference

4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Click **Add endpoint**

6. **Copy the Signing Secret** (starts with `whsec_`)

7. Add it to Supabase:
   - Go to **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
   - Add new secret:
     - **Name:** `STRIPE_WEBHOOK_SECRET`
     - **Value:** Your webhook signing secret

---

## Step 6: Test Everything (15 minutes)

### Test with Test Cards

1. **Sign up** for a new account in your app
2. Navigate to **Subscription** page
3. Click **Upgrade** on Professional or Enterprise plan
4. You'll be redirected to Stripe Checkout
5. Use Stripe's test cards:
   - **Success:** 4242 4242 4242 4242
   - **Decline:** 4000 0000 0000 0002
   - **Requires authentication:** 4000 0025 0000 3155
6. Use any future expiry date (e.g., 12/34) and any 3-digit CVC

### Verify Payment Works

After successful payment:
1. You should be redirected back to your app
2. The subscription status should change from "trial" to "active"
3. Check your **Stripe Dashboard** → **Payments** to see the test payment
4. Check your **Supabase Database** → `user_subscriptions` table to verify the status

---

## Step 7: Go Live (5 minutes)

When you're ready to accept real payments:

1. **In Stripe Dashboard:**
   - Toggle from **Test Mode** to **Live Mode** (top right corner)
   - Complete business verification if not done
   - Add bank account for payouts

2. **Update Supabase Secrets:**
   - Replace `STRIPE_SECRET_KEY` with your **live** secret key
   - Update `STRIPE_WEBHOOK_SECRET` with the live webhook secret

3. **Update Database:**
   - Replace test Price IDs with live Price IDs in the SQL query from Step 4

4. **Test one more time** with a real card (you can refund it immediately)

---

## 🎉 You're Done!

Your app is now ready to accept payments from customers!

### What Happens Next?

**Customer Journey:**
1. Customer signs up → Gets 14-day free trial
2. Trial countdown appears in sidebar
3. After trial (or anytime), customer clicks "Upgrade"
4. Redirected to Stripe Checkout
5. Enters payment info
6. Payment processed securely
7. Subscription becomes active
8. Customer billed monthly/yearly automatically

**You Receive:**
- Automatic payments to your Stripe account
- Payouts to your bank account (Stripe's standard schedule)
- Email notifications for new subscriptions
- Full transaction history in Stripe Dashboard

---

## 💰 Stripe Fees

Stripe charges:
- **2.9% + $0.30** per successful card charge
- No setup fees, monthly fees, or hidden costs
- You keep the rest!

**Example:**
- Customer pays $199/month
- Stripe fee: $6.07
- You receive: $192.93

---

## 📊 Managing Your Business

### View Revenue
- Stripe Dashboard → **Home** for overview
- **Payments** for transaction list
- **Customers** for subscriber list

### Handle Refunds
1. Go to **Payments** → Find transaction
2. Click the payment → **Refund**
3. Enter amount and reason
4. Refund processes automatically

### Cancel Subscriptions
- Customers can't self-cancel (you control this)
- To cancel: Stripe Dashboard → **Subscriptions** → Select subscription → **Cancel**

### Handle Failed Payments
- Stripe automatically retries failed payments
- You'll receive email notifications
- Customer subscription stays active during retry period
- After final failure, subscription cancels automatically

---

## 🆘 Troubleshooting

### "Failed to create checkout session"
- ✅ Verify `STRIPE_SECRET_KEY` is set in Supabase
- ✅ Verify Edge Functions are deployed
- ✅ Check browser console for errors

### "This plan is not available yet"
- ✅ Verify Price IDs are updated in database
- ✅ Run the SQL query from Step 4 again

### Webhook not working
- ✅ Verify `STRIPE_WEBHOOK_SECRET` is set
- ✅ Check webhook URL is correct
- ✅ Verify webhook events are selected

### Customer paid but subscription not active
- ✅ Check Stripe Dashboard → **Webhooks** → **Attempts** for errors
- ✅ Verify webhook secret is correct
- ✅ Check Supabase Edge Function logs

---

## 📞 Support Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Supabase Documentation:** https://supabase.com/docs
- **Test Cards:** https://stripe.com/docs/testing

---

## 🔒 Security Best Practices

✅ **Never share your Secret Key**
✅ **Use Test Mode for testing**
✅ **Enable Stripe Radar** (fraud prevention - it's free!)
✅ **Set up email notifications** in Stripe for important events
✅ **Regularly check** Stripe Dashboard for suspicious activity

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│ STRIPE SETUP CHECKLIST                          │
├─────────────────────────────────────────────────┤
│ ☐ Create Stripe account                         │
│ ☐ Get API keys (test or live)                   │
│ ☐ Create Professional product + 2 prices        │
│ ☐ Create Enterprise product + 2 prices          │
│ ☐ Copy all 4 Price IDs                          │
│ ☐ Update database with Price IDs                │
│ ☐ Set STRIPE_SECRET_KEY in Supabase            │
│ ☐ Deploy Edge Functions                         │
│ ☐ Create webhook endpoint                       │
│ ☐ Set STRIPE_WEBHOOK_SECRET in Supabase        │
│ ☐ Test with test card                           │
│ ☐ Verify subscription activates                 │
│ ☐ Switch to live mode (when ready)              │
└─────────────────────────────────────────────────┘
```

---

**Need Help?** Check the troubleshooting section or contact Stripe Support.

**Ready to make money!** 💰
