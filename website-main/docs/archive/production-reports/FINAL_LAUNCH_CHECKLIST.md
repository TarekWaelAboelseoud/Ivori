# Ivori Digitals — Final Launch Checklist

Use before and immediately after production deploy.

---

## 1. Vercel environment

- [ ] `NEXT_PUBLIC_APP_URL` = `https://ivoridigitals.com` (no trailing slash)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://YOUR_REF.supabase.co` (**no** `/rest/v1`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (server only)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set (if used client-side later)
- [ ] `ADMIN_PASSWORD` — strong, unique (not `admin2024`)
- [ ] Optional: `ADMIN_PATH` custom path (update `proxy.ts` matcher if changed)
- [ ] `RESEND_API_KEY` + `ADMIN_EMAIL` for inquiry emails
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` for contact
- [ ] Redeploy after all env changes

---

## 2. Supabase

- [ ] Run **`supabase/ivori-production.sql`** once in SQL Editor
- [ ] Verify tables: `studio_inquiries`, `leads`, `orders`, `audits`
- [ ] Test insert from contact form → row appears
- [ ] RLS enabled (script handles this)

---

## 3. Studio console

- [ ] Open `https://ivoridigitals.com/studio-ops/login` (or custom `ADMIN_PATH`)
- [ ] Login works
- [ ] `/admin` returns **404** (not redirect to login)
- [ ] Inquiries load without Supabase path error
- [ ] Update inquiry status / notes saves

---

## 4. Public site smoke tests

- [ ] Homepage hero, scroll, CTAs
- [ ] `/contact` form submits
- [ ] `/ar` RTL layout
- [ ] `/ai-production` abstract hero
- [ ] Service pages (CRO, Shopify, media)
- [ ] Mobile: iPhone + Android
- [ ] No console errors in browser devtools

---

## 5. SEO

- [ ] `https://ivoridigitals.com/robots.txt` — disallow admin/api
- [ ] `https://ivoridigitals.com/sitemap.xml` — core routes
- [ ] OG preview: share link in iMessage/Slack
- [ ] Google Search Console property verified (post-launch)

---

## 6. Security

- [ ] Confirm `X-Powered-By` absent (curl -I)
- [ ] HSTS header present
- [ ] `/api/studio-ops/auth` returns 429 after repeated failures
- [ ] No service role key in client bundle (view page source / network)

---

## 7. Analytics & monitoring (optional post-launch)

- [ ] Plausible / Vercel Analytics (privacy-friendly)
- [ ] Uptime monitor on homepage + contact API
- [ ] Supabase dashboard alerts

---

## 8. Backups

- [ ] Supabase point-in-time recovery enabled (plan dependent)
- [ ] GitHub repo access restricted
- [ ] `.env` secrets not in git

---

## 9. DNS & domain

- [ ] Apex + www → Vercel
- [ ] SSL active
- [ ] `www` redirect policy decided

---

## 10. Post-launch (week 1)

- [ ] Monitor inquiry queue daily
- [ ] Fix any mobile overflow reported
- [ ] Submit sitemap in Search Console
- [ ] Instagram content per `ivori-brand-system.md`

---

## Quick reference

| Resource | Path |
|----------|------|
| Brand / Instagram OS | `content-system/ivori-brand-system.md` |
| Production audit | `content-system/PRODUCTION_AUDIT.md` |
| Security surface | `content-system/SECURITY_SURFACE_REPORT.md` |
| DB setup | `supabase/ivori-production.sql` |
| Console URL | `/studio-ops` (default) |
