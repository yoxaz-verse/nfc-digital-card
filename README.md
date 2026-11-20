# Card Studio

A Vue 3 digital-card studio with front/back editing, 3D preview, reusable public profiles, and connected QR/NFC destinations. Users design cards first, then publish or attach a profile that opens when the card is scanned or tapped.

## Local development

```bash
npm install
npm run dev
```

Without backend variables, cards and profiles run in local demo mode. Copy `.env.example` to `.env.local` to use cloud cards, public profiles, Supabase, and Cloudflare Turnstile.

## Production setup

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor.
2. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_TURNSTILE_SITE_KEY` to the web deployment.
3. Deploy `supabase/functions/submit-contact`.
4. Configure Edge Function secrets: `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`.
5. Replace the verified Resend sender in the Edge Function with the production sending domain.

Card projects are owner-only Supabase records with private assets. Profile images use the public `profile-media` bucket. Profile editing, analytics, and contact submissions are protected by row-level security.

## Verification

```bash
npm test
npm run build
```
