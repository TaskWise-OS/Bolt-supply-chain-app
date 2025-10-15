# Quick Start Deployment (30 Minutes)

## 🚀 Get Your App Live TODAY

Follow these steps to deploy in the next 30 minutes.

---

## Step 1: Deploy to Vercel (10 min)

### If you don't have a GitHub repo yet:

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit - ready for production"

# Create repo on GitHub, then:
git remote add origin https://github.com/TaskWise-OS/Bolt-App.git
git push -u origin main
```

### Deploy:

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"New Project"**
4. Select your repository
5. Vercel will auto-detect settings (Vite)
6. Add environment variables:
   - `VITE_SUPABASE_URL` = (from your .env file)
   - `VITE_SUPABASE_ANON_KEY` = (from your .env file)
7. Click **"Deploy"**
8. Wait 2-3 minutes
9. ✅ Your app is live!

**You'll get a URL like:** `your-app.vercel.app`

---

## Step 2: Switch Stripe to Live Mode (10 min)

### Get Live API Keys:

1. Go to https://dashboard.stripe.com
2. Toggle "Test mode" → "Live mode" (top right)
3. Go to **Developers → API Keys**
4. Copy:
   - **Publishable key** (pk_live_...)
   - **Secret key** (sk_live_...) ← Keep this SUPER secret!

### Update Supabase Secrets:

1. Go to Supabase Dashboard
2. Click **Edge Functions** in sidebar
3. Click **Settings** tab
4. Find **Secrets** section
5. Update `STRIPE_SECRET_KEY` with your **live secret key**
6. Click **Save**

---

## Step 3: Configure Stripe Webhook (5 min)

### Add Webhook Endpoint:

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click **"Add endpoint"**
3. Enter URL:
   ```
   https://xtqtcvjkibkfqrkikoly.supabase.co/functions/v1/stripe-webhook
   ```
   (Use your actual Supabase project URL)

4. Click **"Select events"**
5. Check these events:
   - ✅ checkout.session.completed
   - ✅ customer.subscription.created
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
   - ✅ invoice.payment_succeeded
   - ✅ invoice.payment_failed

6. Click **"Add endpoint"**
7. Copy the **Webhook signing secret** (starts with `whsec_`)
8. Go back to Supabase → Edge Functions → Secrets
9. Update `STRIPE_WEBHOOK_SECRET` with this value
10. Click **Save**

---

## Step 4: Test Everything (5 min)

### End-to-End Test:

1. Go to your deployed app: `your-app.vercel.app`
2. Sign up with a new test email
3. You should automatically get a 14-day trial ✅
4. Click **"Pricing"** in sidebar
5. Click **"Get Started"** on any plan
6. Should redirect to Stripe checkout
7. **Use a REAL credit card** (it will charge!)
8. Complete payment
9. Should redirect to `/success`
10. Features should unlock immediately

### Check if it worked:

1. In Stripe Dashboard → **Subscriptions**
2. You should see your new subscription
3. In Supabase → **Table Editor** → `stripe_user_subscriptions`
4. You should see a row with `subscription_status = 'active'`

✅ **If you see all of this, you're LIVE!**

---

## Step 5: Add Custom Domain (Optional, 5 min)

### In Vercel:

1. Go to your project → **Settings** → **Domains**
2. Enter your domain (e.g., `supplyvision.com`)
3. Click **Add**
4. Copy the DNS records Vercel shows you
5. Go to your domain registrar (GoDaddy, Namecheap, etc.)
6. Add these DNS records
7. Wait 10-60 minutes for DNS to propagate
8. ✅ Your app now loads at your custom domain!

### Update Supabase Redirect URLs:

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `https://your-domain.com/**`
   - `https://your-domain.com/success`
4. Click **Save**

---

## 🎉 You're Live!

Your app is now accepting real payments and fully operational.

## What Happens Now?

### When Someone Signs Up:
1. Gets 14-day free trial automatically
2. Can use all trial features
3. Sees trial countdown banner at day 7
4. Gets reminder when trial expires
5. Can upgrade anytime

### When Someone Upgrades:
1. Clicks "Get Started" on pricing page
2. Redirects to Stripe checkout
3. Enters credit card
4. Payment processed
5. Webhook updates database
6. Features unlock immediately
7. Trial banner disappears

### Monthly Billing:
- Stripe automatically charges customers
- You get paid (minus 2.9% + $0.30 fee)
- Customers can cancel anytime
- You can see everything in Stripe Dashboard

---

## Important Next Steps

### Today:
- [ ] Test signup flow with real credit card
- [ ] Verify webhook is working (check Stripe → Developers → Events)
- [ ] Share with 3-5 beta users for feedback

### This Week:
- [ ] Add Terms of Service page (use https://termly.io)
- [ ] Add Privacy Policy page
- [ ] Set up support email (support@your-domain.com)
- [ ] Add error tracking (Sentry)

### This Month:
- [ ] Announce on LinkedIn
- [ ] Post on Product Hunt
- [ ] Reach out to potential customers
- [ ] Gather feedback and iterate

---

## Costs to Expect

### Free Tier (Your Starting Point):
- **Vercel**: Free forever for personal projects
- **Supabase**: Free up to 50,000 users
- **Stripe**: Only 2.9% + $0.30 per transaction
- **Total**: $0/month + transaction fees

### When to Upgrade:
- Vercel Pro ($20/mo): When you need advanced features
- Supabase Pro ($25/mo): When you hit 50,000 users or need daily backups
- You'll know when you need to upgrade

---

## Revenue Calculator

**If you get:**
- 10 users × $49 Basic = $490/mo - $16.20 fees = **$473.80/mo**
- 10 users × $149 Pro = $1,490/mo - $46.20 fees = **$1,443.80/mo**
- 5 users × $399 Enterprise = $1,995/mo - $61.50 fees = **$1,933.50/mo**

**Your actual profit** = Revenue - Stripe fees - Hosting costs

Most SaaS businesses aim for 50-100 customers in first 6 months.

---

## Need Help?

Check these resources:
- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs

Or refer to the full **PRODUCTION_DEPLOYMENT_GUIDE.md** in your project.

---

## 🚀 You're Ready to Make Money!

Your app is now live and accepting payments. Focus on:
1. Getting users
2. Gathering feedback
3. Iterating on features

Good luck! 🎉
