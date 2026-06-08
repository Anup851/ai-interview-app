# PrepPilot Deployment Checklist

## 1. Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Enable email auth.
4. Enable Google auth in Authentication > Providers:
   - Add your Google OAuth client ID and secret.
   - Add `http://localhost:5173/app` and your production `https://your-domain.com/app` URL to Supabase redirect URLs.
   - Add the matching URLs to the Google Cloud OAuth authorized redirect/origin settings shown by Supabase.
5. Create Edge Function secrets:

```bash
supabase secrets set OPENAI_API_KEY=your_key
```

6. Deploy functions:

```bash
supabase functions deploy generate-questions
supabase functions deploy analyze-resume
supabase functions deploy score-interview
```

## 2. Frontend Env

Create `.env` from `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_MODE=production
```

## 3. Deploy

Use Vercel or Netlify.

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

## 4. SaaS Gaps To Finish Before Charging Users

- Stripe checkout, billing portal, and webhooks.
- Real PDF text extraction before calling `analyze-resume`.
- Real browser audio recording upload and speech-to-text.
- Usage quota enforcement for free/pro plans.
- Sentry or equivalent error monitoring.
- Analytics for conversion and product usage.
- Admin dashboard for support and abuse review.
