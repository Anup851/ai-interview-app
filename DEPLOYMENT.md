# PrepPilot Deployment Checklist

## 1. Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor. Re-run it after updates; it uses `if not exists` and safe policy replacement.
3. Enable email auth.
4. Enable Google auth in Authentication > Providers:
   - Add your Google OAuth client ID and secret.
   - In Google Cloud, add the Supabase callback URL as an authorized redirect URI:
     `https://your-project-ref.supabase.co/auth/v1/callback`
   - In Supabase URL Configuration, set Site URL to your frontend root, for example:
     `https://your-render-site.onrender.com`
   - Add redirect URLs:
     `https://your-render-site.onrender.com`,
     `https://your-render-site.onrender.com/app`,
     `http://localhost:5173`,
     `http://localhost:5173/app`,
     `http://localhost:3000`,
     `http://localhost:3000/app`.
5. Create Edge Function secrets:

```bash
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set SITE_URL=https://your-render-site.onrender.com
supabase secrets set STRIPE_SECRET_KEY=sk_live_or_test_key
supabase secrets set STRIPE_PRICE_ID_PRO=price_id_for_pro_plan
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_from_stripe
```

6. Deploy functions:

```bash
supabase functions deploy generate-questions
supabase functions deploy analyze-resume
supabase functions deploy score-interview
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

The app uses these Supabase services:

- Auth for email/Google login.
- Postgres for profiles, resumes, analyses, interviews, feedback, usage, and subscriptions.
- Storage buckets: `resumes`, `reports`, and `interview-audio`.
- Edge Functions for AI question generation, ATS analysis, interview scoring, Stripe checkout, and Stripe webhooks.

## 2. Frontend Env

Create `.env` from `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_MODE=production
```

Local Vite does not read `.env.example`. For local login, create `.env` and restart the dev server.

## 3. Render Deploy

Use Render Static Site.

Build command:

```bash
npm install && npm run build
```

Output directory:

```bash
dist
```

Add environment variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_MODE=production
```

Add this Redirect/Rewrite rule in Render if the Blueprint does not apply it automatically:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

## 4. Feature Flow

Resume analysis:

1. User uploads a text-based PDF.
2. Browser extracts PDF text with `pdfjs-dist`.
3. PDF is stored in Supabase Storage.
4. Extracted text is saved to `resumes.extracted_text`.
5. `analyze-resume` returns ATS JSON.
6. Result is saved to `resume_analyses`.

Interview flow:

1. User generates questions with `generate-questions`.
2. Questions are saved to `question_sets` and `generated_questions`.
3. User completes a mock interview with typed transcript and optional browser audio recording.
4. Audio is saved in `interview-audio`.
5. Transcript is sent to `score-interview`.
6. Scores and feedback are saved to `mock_interviews`, `interview_answers`, and `ai_feedback`.

Usage limits:

- Free users are limited in `src/services/usageService.js`.
- Usage is recorded in `usage_events`.
- Plan state is read from `subscriptions`.

## 5. Stripe Setup

1. Create a Stripe account.
2. Create a recurring Pro product and price.
3. Save the price ID as `STRIPE_PRICE_ID_PRO`.
4. Deploy `create-checkout-session`.
5. Create a Stripe webhook endpoint pointing to:
   `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
6. Subscribe the webhook to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
7. Save the webhook secret as `STRIPE_WEBHOOK_SECRET`.

## 6. SaaS Gaps To Finish Before Charging Users

- Stripe billing portal.
- Speech-to-text for audio-only interviews.
- Sentry or equivalent error monitoring.
- Analytics for conversion and product usage.
- Admin dashboard for support and abuse review.
- Legal pages: privacy policy, terms, refund policy.
- Data deletion/export flow.
