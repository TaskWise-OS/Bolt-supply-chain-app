# Netlify Deployment - Complete Step-by-Step Guide

## 🚀 Deploy Your Supply Chain App to Netlify

Follow these exact steps. I'll tell you exactly when to publish.

---

## Prerequisites Checklist

Before starting, make sure you have:
- [ ] Your app is working locally
- [ ] Stripe test mode is working
- [ ] You have a GitHub/GitLab/Bitbucket account
- [ ] You know your Supabase URL and Anon Key (from .env file)

---

## PART 1: PREPARE YOUR CODE (Don't Publish Yet!)

### Step 1: Check Your Build Configuration

Your app is already configured correctly for Netlify. Let's verify:

**✅ Check `package.json` has these scripts:**
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

**✅ Check build works locally:**
```bash
npm run build
```

You should see:
```
✓ built in 5s
dist/index.html
dist/assets/...
```

If build fails, fix errors before continuing.

---

### Step 2: Create Git Repository (If Not Already Done)

**Check if you have git initialized:**
```bash
git status
```

**If you see "not a git repository":**
```bash
# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - ready for deployment"
```

**If you already have git:**
```bash
# Make sure everything is committed
git status

# If there are changes, commit them:
git add .
git commit -m "Prepare for deployment"
```

---

### Step 3: Push to GitHub (Required for Netlify)

**Option A: Create New GitHub Repository**

1. Go to https://github.com/new
2. Repository name: `supplyvision-app` (or your preferred name)
3. **Important**: Keep it **Private** (your code, your business)
4. **Do NOT** initialize with README, .gitignore, or license
5. Click **"Create repository"**

6. GitHub will show you commands. Copy and run them:
```bash
git remote add origin https://github.com/TaskWise-OS/Bolt-App.git
git branch -M main
git push -u origin main
```

**Option B: Use Existing Repository**

```bash
# If you already have a remote
git push origin main

# Or if you need to set upstream
git push -u origin main
```

**✅ Verify:** Go to your GitHub repo in browser - you should see all your files.

---

## PART 2: DEPLOY TO NETLIFY (Still Not Live Yet!)

### Step 4: Sign Up for Netlify

1. Go to https://netlify.com
2. Click **"Sign up"**
3. Choose **"GitHub"** (easiest option)
4. Authorize Netlify to access your GitHub
5. You'll land on your Netlify dashboard

---

### Step 5: Create New Site

1. Click **"Add new site"** button (or "Import from Git")
2. Select **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. You may need to authorize Netlify again - click **"Authorize Netlify"**

---

### Step 6: Select Your Repository

1. You'll see a list of your GitHub repositories
2. **Don't see your repo?** Click **"Configure Netlify on GitHub"**
   - Select which repos Netlify can access
   - Choose "All repositories" or select specific ones
   - Click **"Save"**
   - Go back to Netlify tab
3. Find and click your **supplyvision-app** repository

---

### Step 7: Configure Build Settings

Netlify should auto-detect everything, but verify:

**Branch to deploy:**
```
main
```

**Build command:**
```
npm run build
```

**Publish directory:**
```
dist
```

**Build settings should look like this:**
```
Base directory: (leave empty)
Build command: npm run build
Publish directory: dist
Functions directory: (leave empty)
```

**✅ If auto-detected correctly:** Leave as is
**❌ If wrong:** Manually enter the values above

---

### Step 8: Add Environment Variables (CRITICAL!)

**DO THIS BEFORE DEPLOYING!**

Still on the site setup page:

1. Click **"Show advanced"** or scroll down to **"Environment variables"**
2. Click **"Add environment variables"**

**Add these TWO variables:**

**Variable 1:**
```
Key:   VITE_SUPABASE_URL
Value: [paste your Supabase URL from .env]
```

Example: `https://xtqtcvjkibkfqrkikoly.supabase.co`

**Variable 2:**
```
Key:   VITE_SUPABASE_ANON_KEY
Value: [paste your Supabase anon key from .env]
```

Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long string)

**✅ Double-check:**
- Variable names are EXACT (including VITE_ prefix)
- Values are correct (no extra spaces)
- You added BOTH variables

---

### Step 9: Deploy! (This Makes It Live)

**⚠️ IMPORTANT:** Once you click this, your app will be publicly accessible on the internet!

1. Review all settings one more time
2. Click **"Deploy [your-repo-name]"** button
3. You'll see deployment progress:
   ```
   ⏳ Building...
   📦 Uploading...
   ✅ Published!
   ```
4. This takes 2-5 minutes

**What's happening:**
- Netlify clones your GitHub repo
- Runs `npm install`
- Runs `npm run build`
- Uploads `dist/` folder to CDN
- Makes your app live globally

---

### Step 10: Your App is LIVE! 🎉

**You'll see:**
```
✅ Site is live
🌐 https://random-name-123456.netlify.app
```

**Click the URL** - Your app is now live on the internet!

---

## PART 3: CUSTOMIZE YOUR DEPLOYMENT

### Step 11: Change Site Name (Optional but Recommended)

1. On your site dashboard, click **"Site settings"**
2. Scroll to **"Site information"**
3. Under **"Site name"**, click **"Change site name"**
4. Enter a better name: `supplyvision` or `your-company-supply`
5. Click **"Save"**
6. Your new URL: `https://supplyvision.netlify.app`

**⚠️ Note:** Netlify subdomain names must be unique globally.

---

### Step 12: Configure Supabase Redirect URLs

**Critical for authentication to work!**

1. Go to **Supabase Dashboard**
2. Click your project
3. Go to **Authentication** → **URL Configuration**
4. Update **Site URL**:
   ```
   https://your-site-name.netlify.app
   ```
5. Add to **Redirect URLs** (click "Add URL"):
   ```
   https://your-site-name.netlify.app/**
   https://your-site-name.netlify.app/success
   https://your-site-name.netlify.app/pricing
   ```
6. Click **"Save"**

---

## PART 4: SWITCH TO LIVE STRIPE (Production Mode)

### Step 13: Get Stripe Live API Keys

**⚠️ IMPORTANT:** This enables REAL payments!

1. Go to https://dashboard.stripe.com
2. **Toggle from "Test mode" to "Live mode"** (top right switch)
3. Go to **Developers** → **API keys**
4. You'll see:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`) - Click "Reveal"

**Copy the Secret key** (sk_live_...) - You'll need it next.

**⚠️ KEEP THIS SECRET!** Never share it, never commit it to GitHub!

---

### Step 14: Update Supabase Edge Function Secrets

1. Go to **Supabase Dashboard**
2. Click **Edge Functions** in left sidebar
3. Click **Settings** tab at top
4. Scroll to **Secrets** section
5. Find `STRIPE_SECRET_KEY`
6. Click **Edit** (pencil icon)
7. **Replace** with your **live secret key** (sk_live_...)
8. Click **Save** or **Update**

**✅ Verify:** The secret should now start with `sk_live_` not `sk_test_`

---

### Step 15: Configure Stripe Webhook for Production

**This tells Stripe where to send payment events.**

1. In Stripe Dashboard (Live mode!), go to **Developers** → **Webhooks**
2. Click **"Add endpoint"** button
3. **Endpoint URL** - Enter your Supabase webhook URL:
   ```
   https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
   ```
   
   **How to find your project ID:**
   - Look at your Supabase URL: `https://xtqtcvjkibkfqrkikoly.supabase.co`
   - The ID is: `xtqtcvjkibkfqrkikoly`
   
4. **Description** (optional): `Production Webhook`

5. **Select events to listen to** - Click and check these:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

6. Click **"Add endpoint"**

7. **Copy the webhook signing secret:**
   - On the webhook details page, find **"Signing secret"**
   - Click **"Reveal"**
   - Copy the value (starts with `whsec_`)

8. Go back to **Supabase** → **Edge Functions** → **Settings** → **Secrets**
9. Find `STRIPE_WEBHOOK_SECRET`
10. Click **Edit**
11. **Replace** with the new webhook secret (whsec_...)
12. Click **Save**

**✅ Verify in Stripe:** The webhook should show "Enabled" with a green dot.

---

## PART 5: TEST YOUR PRODUCTION DEPLOYMENT

### Step 16: Test Signup Flow

1. Go to your Netlify URL: `https://your-site-name.netlify.app`
2. Click **"Sign up"**
3. Create a new account with a real email
4. Check your email for confirmation (if email confirmation is enabled)
5. Log in
6. **✅ You should see:** 14-day trial banner

---

### Step 17: Test Stripe Payment (REAL MONEY!)

**⚠️ WARNING:** You'll be charged real money. Use your own card for testing!

1. While logged in, click **"Pricing"** in sidebar
2. Choose a plan (start with Basic $49 to minimize cost)
3. Click **"Get Started"**
4. Should redirect to **Stripe Checkout page**
5. Enter your **REAL credit card**:
   - Your actual card number
   - Expiration date
   - CVC
   - Billing address
6. Click **"Subscribe"**
7. Payment processes (you'll be charged!)
8. Should redirect to `https://your-site-name.netlify.app/success`
9. **✅ Success message appears**
10. **✅ Trial banner disappears**
11. **✅ Features unlock immediately**

---

### Step 18: Verify Everything Worked

**In Stripe Dashboard:**
1. Go to **Customers** - You should see your new customer
2. Go to **Subscriptions** - You should see active subscription
3. Go to **Events** - You should see recent webhook events
4. Click an event → Check "Webhook deliveries" shows ✅ success

**In Supabase Dashboard:**
1. Go to **Table Editor**
2. Open `stripe_user_subscriptions` table
3. Find your user's row
4. Verify:
   - `subscription_status` = `'active'`
   - `price_id` matches your plan
   - `current_period_end` is ~30 days from now

**In Your App:**
1. Refresh the page
2. All features should work
3. No trial banner
4. Subscription shown in account settings

**✅ If all checks pass:** Your production deployment is successful!

---

## PART 6: CANCEL TEST SUBSCRIPTION (Save Money!)

Since you tested with real money, you probably want to cancel:

1. Go to **Stripe Dashboard** → **Subscriptions**
2. Click your test subscription
3. Click **"Cancel subscription"**
4. Choose:
   - **"Cancel immediately"** - Refund and stop now
   - **"Cancel at period end"** - Use for rest of month
5. Click **"Cancel subscription"**

**You'll get a refund if you cancel immediately (within 24 hours usually).**

---

## PART 7: ONGOING DEPLOYMENT

### Step 19: Deploy Updates

**Every time you want to update your app:**

```bash
# Make your changes locally
# Test them: npm run dev

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

**Netlify automatically:**
1. Detects the push
2. Builds your app
3. Deploys updates
4. Your site updates in 2-5 minutes!

**✅ Check deployment:**
- Go to Netlify dashboard
- See deployment status
- Check deploy logs if there are errors

---

### Step 20: Add Custom Domain (Optional)

**If you own a domain (e.g., supplyvision.com):**

1. In Netlify, go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain: `supplyvision.com`
4. Click **"Verify"**
5. Netlify shows DNS records to add
6. Go to your domain registrar (GoDaddy, Namecheap, etc.)
7. Add the DNS records Netlify specified:
   - Usually an A record or CNAME
8. Wait 10 minutes to 24 hours for DNS to propagate
9. Netlify automatically provisions free SSL certificate
10. Your app is live at `https://supplyvision.com`! 🎉

**Update Supabase URLs:**
- Go back to **Supabase** → **Authentication** → **URL Configuration**
- Update Site URL to `https://supplyvision.com`
- Update redirect URLs to your custom domain

---

## TROUBLESHOOTING

### ❌ Build Fails on Netlify

**Check deploy logs:**
1. Netlify dashboard → Deploys → Click failed deploy
2. Read the error message
3. Common issues:
   - Missing dependencies: `npm install` locally
   - TypeScript errors: Run `npm run build` locally to find them
   - Environment variables missing: Add them in Netlify settings

**Fix:**
```bash
# Fix locally
npm run build

# If it works locally, commit and push
git add .
git commit -m "Fix build errors"
git push origin main
```

---

### ❌ App Loads But Shows Blank Page

**Check browser console (F12):**

**Common causes:**
1. **Environment variables missing**
   - Go to Netlify → Site settings → Environment variables
   - Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist
   - If you added them after deploy, **trigger a new deploy**:
     - Deploys → Trigger deploy → Deploy site

2. **Supabase URL incorrect**
   - Check it matches exactly (no trailing slash)

---

### ❌ Login Doesn't Work

**Error: "Invalid redirect URL"**

**Fix:**
1. Go to Supabase → Authentication → URL Configuration
2. Add your Netlify URL to redirect URLs
3. Make sure Site URL matches your Netlify URL

---

### ❌ Stripe Checkout Doesn't Work

**Common issues:**

1. **Still using test mode**
   - Verify Supabase secrets use `sk_live_` not `sk_test_`

2. **Webhook not configured**
   - Go to Stripe → Developers → Webhooks
   - Verify endpoint exists and is enabled

3. **Wrong webhook URL**
   - Should be: `https://[PROJECT_ID].supabase.co/functions/v1/stripe-webhook`
   - NOT your Netlify URL

---

### ❌ Payment Works But Features Don't Unlock

**Check webhook delivery:**
1. Stripe Dashboard → Developers → Webhooks
2. Click your webhook
3. Check recent delivery attempts
4. If failed (red X), click to see error
5. Common fix: Update `STRIPE_WEBHOOK_SECRET` in Supabase

---

## DEPLOYMENT CHECKLIST

### ✅ Pre-Deployment
- [x] App builds successfully locally (`npm run build`)
- [x] Code pushed to GitHub
- [x] Supabase URL and Anon Key ready

### ✅ Netlify Setup
- [x] Account created
- [x] Site deployed from GitHub
- [x] Environment variables added (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [x] Site name customized
- [x] Custom domain added (optional)

### ✅ Supabase Configuration
- [x] Site URL updated with Netlify URL
- [x] Redirect URLs added
- [x] Edge Function secrets configured

### ✅ Stripe Live Mode
- [x] Switched to Live mode
- [x] Live API keys copied
- [x] `STRIPE_SECRET_KEY` updated in Supabase (sk_live_...)
- [x] Production webhook endpoint added
- [x] Webhook events selected (6 events)
- [x] `STRIPE_WEBHOOK_SECRET` updated in Supabase

### ✅ Testing
- [x] Signup works
- [x] Trial starts automatically
- [x] Pricing page loads
- [x] Stripe checkout redirects
- [x] Payment processes (real money!)
- [x] Success page loads
- [x] Features unlock
- [x] Subscription shows in Stripe
- [x] Database updated in Supabase

### ✅ Post-Launch
- [x] Test subscription canceled (to save money)
- [x] Monitoring set up
- [x] Support email ready
- [x] Terms & Privacy pages added (recommended)

---

## 🎉 CONGRATULATIONS!

Your app is now live on Netlify and accepting real payments through Stripe!

**Your live URLs:**
- **App**: https://your-site-name.netlify.app (or your custom domain)
- **Webhook**: https://[PROJECT_ID].supabase.co/functions/v1/stripe-webhook

**What happens now:**
1. Users sign up → Get 14-day trial
2. Users upgrade → Stripe processes payment
3. Webhook updates database
4. Features unlock automatically
5. You get paid monthly! 💰

**Next steps:**
1. Add Terms of Service and Privacy Policy pages
2. Set up customer support
3. Start marketing!
4. Get your first paying customer 🚀

Good luck with your launch! 🎉
