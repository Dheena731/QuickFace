# QuickFace — SaaS Business Plan

> Created: 2026-06-08 | Updated: 2026-06-08  
> Status: Planning phase

---

## Executive Summary

QuickFace is positioned to enter the event photo delivery market as the **only platform that offers both a managed SaaS and a self-hosted option**. The core product (selfie → instant photo retrieval) is built. The gap is the multi-tenant SaaS layer, authentication, billing, and go-to-market.

Target revenue: **$10K MRR within 12 months** of SaaS launch.

---

## Product Tiers

### Tier 0 — Open Source (Free, self-hosted)
- Full codebase on GitHub (already public)
- Self-hosted via Docker Compose
- Attracts developers, builds brand, drives enterprise inbound
- No cost to us; community support only

### Tier 1 — Starter (Cloud SaaS)
**Price: $29/month or $19/event**
- Up to 5 active events/month
- Up to 2,000 photos per event
- 500 guest searches/month
- Basic branding (QuickFace watermark on search page)
- Email support (48h response)
- Storage: Cloudflare R2 (managed by us)

### Tier 2 — Professional (Cloud SaaS)
**Price: $79/month**
- Unlimited events
- Up to 10,000 photos per event
- Unlimited guest searches
- Custom branding (logo, colors, domain)
- Priority support (24h response)
- Analytics dashboard (searches per event, match rate)
- Custom similarity threshold per event
- API access

### Tier 3 — Studio (Cloud SaaS)
**Price: $199/month**
- Everything in Pro
- Up to 50,000 photos per event
- Bulk upload API
- Multi-user studio accounts (team seats)
- White-label guest URL (yourbrand.com/event/xyz)
- Dedicated Celery worker (faster processing)
- Phone support
- SLA: 99.9% uptime

### Tier 4 — Enterprise (Self-hosted License)
**Price: $2,000/year or $5,000 one-time**
- Full source code license with commercial use rights
- Deploy on-premise or private cloud
- No data leaves customer infrastructure (GDPR/FERPA compliant)
- Annual support contract includes updates and patches
- Target: Schools, government, healthcare, EU/UK companies

---

## Unit Economics

### Cost per Event (Cloud SaaS)
| Component | Cost estimate | Notes |
|---|---|---|
| R2 Storage (2,000 photos × 5MB) | ~$0.15/mo | $0.015/GB, no egress |
| Face processing (Celery CPU) | ~$0.10 | ~2s CPU/photo on $20/mo server |
| pgvector search | ~$0.01 | Indexed, sub-100ms queries |
| **Total cost per event** | **~$0.26** | Very low marginal cost |

**Starter ($19/event):** ~73× markup. Gross margin ~99%.  
**Professional ($79/mo, ~8 events avg):** Cost ~$2.08/month. Gross margin ~97%.

### Infrastructure Cost at Scale
| Monthly events | Server cost | R2 cost | Total | Revenue (Pro avg) |
|---|---|---|---|---|
| 50 | $40 (2 workers) | $4 | $44 | $3,950 |
| 200 | $80 (4 workers) | $15 | $95 | $15,800 |
| 1,000 | $200 (10 workers) | $75 | $275 | $79,000 |

Infrastructure scales sub-linearly because pgvector and R2 handle load efficiently.

---

## Go-To-Market Strategy

### Phase 1 — Community Launch (Month 1–2)
**Goal:** 100 GitHub stars, 20 self-hosted users, 5 paying customers

**Actions:**
- Launch on **Product Hunt** (target Top 5 of the day in Developer Tools)
- Post on **Hacker News** Show HN: "Open-source selfie photo delivery for photographers"
- Submit to **r/selfhosted**, **r/photography**, **r/weddingphotography**
- Post on **Indie Hackers** with full build story
- Create a 2-minute demo video (upload photos → guest selfie → results)
- List on **awesome-selfhosted** GitHub list

**Messaging:** "Own your photo delivery. No subscription trap, no vendor lock-in. Open-source."

### Phase 2 — Photographer Community (Month 2–4)
**Goal:** 50 paying customers, $1,500 MRR

**Channels:**
- **Facebook Groups:** Wedding Photographers of [City], Photography Business groups (30M+ combined members)
- **Instagram/TikTok:** Demo reels showing "guests find their photos in 10 seconds"
- **YouTube:** Tutorial "Replace Pixieset with your own selfie photo search"
- **Direct outreach:** 200 cold DMs to wedding photographers on Instagram
- **Partner:** 2–3 photography influencers for affiliate/review posts

**Message shift:** "Your guests shouldn't have to scroll 400 photos. Give them their photos instantly."

### Phase 3 — Corporate & Event Market (Month 4–8)
**Goal:** 200 paying customers, $8,000 MRR

**Channels:**
- **LinkedIn outreach:** Event managers, corporate event planners, conference organizers
- **Conference circuit:** Exhibit at 1–2 photography trade shows (WPPI, Imaging USA)
- **Partnerships:** Photo printing labs (WHCC, Mpix) — integrate QuickFace into their workflow
- **SEO content:** "best event photo sharing app", "selfie photo retrieval for events", "facial recognition photo delivery"
- **Case study:** Document one real event end-to-end, publish results

### Phase 4 — Enterprise & White Label (Month 8–12)
**Goal:** 5 enterprise licenses ($10,000 ARR), 3 white-label partners

**Channels:**
- **Inbound from open-source:** Schools, government IT departments discovering via GitHub
- **LinkedIn Sales Navigator:** Target school district IT directors, university communications departments
- **Agency partnerships:** Digital agencies that run event activations — offer white-label QuickFace as their photo delivery layer
- **EU market:** GDPR compliance is a hard requirement; QuickFace self-hosted is uniquely positioned

---

## Technical SaaS Transformation Roadmap

### Sprint 1 — Multi-Tenancy Foundation (2–3 weeks)
The current codebase is single-tenant. These changes make it multi-tenant SaaS-ready.

**Backend:**
- [ ] `Organization` model (tenant) with UUID PK
- [ ] `User` model with bcrypt hashed passwords
- [ ] JWT authentication (access token 15min, refresh token 7 days)
- [ ] `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- [ ] Event ownership: `event.organization_id` FK enforced on all operations
- [ ] Middleware: extract JWT, inject `current_user` into route handlers
- [ ] Row-level isolation: all queries scoped to `organization_id`

**Frontend:**
- [ ] `/login` and `/register` pages
- [ ] JWT stored in HttpOnly cookie (not localStorage)
- [ ] Authenticated route wrapper component
- [ ] Studio dashboard shows only current org's events

### Sprint 2 — Billing Integration (1–2 weeks)
- [ ] Integrate **Stripe** (Stripe Checkout + Customer Portal)
- [ ] `Subscription` model: tier, status, stripe_customer_id, stripe_subscription_id
- [ ] Webhook handler for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Usage enforcement middleware: check event count, photo count against plan limits
- [ ] Billing page in studio dashboard (upgrade, cancel, view invoices)
- [ ] Free tier: 1 event, 200 photos, 100 searches/month — no credit card required

### Sprint 3 — Branding & Custom Domains (1–2 weeks)
- [ ] Per-event branding: logo URL, primary color, event title displayed on search page
- [ ] Custom subdomain support: `events.yourstudio.com` → proxy to QuickFace with `X-Studio-ID` header
- [ ] Email customization: event invitation email template with studio branding
- [ ] Guest search page theming via CSS variables injected per-event

### Sprint 4 — Analytics Dashboard (1 week)
- [ ] `SearchLog` model: event_id, timestamp, result_count, similarity_scores
- [ ] Studio dashboard: searches per day, average match rate, top events by activity
- [ ] Admin view: platform-wide metrics for internal monitoring

### Sprint 5 — Production Infrastructure (1–2 weeks)
- [ ] Move from Docker Compose to **Railway** or **Render** (managed Postgres + Redis)
- [ ] Or: self-managed on **Hetzner** (€20/month, 4-core/8GB) for cost efficiency
- [ ] CDN: Cloudflare in front of API + R2 public domain
- [ ] Auto-scaling Celery workers based on queue depth (via Celery autoscale)
- [ ] Monitoring: Sentry for error tracking, Uptime Robot for availability
- [ ] Backup: daily pg_dump to separate R2 bucket

### Sprint 6 — Polish & Launch (1 week)
- [ ] Landing page redesign: conversion-focused, pricing table, live demo
- [ ] Onboarding flow: create account → create event → upload 3 test photos → share guest link (< 5 minutes)
- [ ] Help docs: "Getting started", "Uploading photos", "Custom domains"
- [ ] GDPR privacy policy and terms of service

---

## Competitive Differentiation Summary

| Axis | Waldo Photos | Memzo | GuestCam | **QuickFace SaaS** |
|---|---|---|---|---|
| Pricing model | Subscription | Per-photo | Per-event | **Both: subscription + per-event** |
| Self-hosted option | ❌ | ❌ | ❌ | **✅** |
| Open source | ❌ | ❌ | ❌ | **✅** |
| App required | ✅ (friction) | ❌ | ❌ | **❌** |
| GDPR compliant option | ❌ | ❌ | ❌ | **✅** |
| White-label | ❌ | ❌ | ❌ | **✅** |
| Similarity tuning | ❌ | ❌ | ❌ | **✅** |
| Storage cost structure | S3 egress fees | Unknown | Unknown | **R2 = $0 egress** |
| Entry price | $29.99/mo | $0.03/photo | $0 + $45 addon | **$0 (free tier)** |

---

## Revenue Milestones

| Milestone | Target Date | MRR | Customers | Key Action |
|---|---|---|---|---|
| SaaS alpha (friends & family) | Month 3 | $200 | 5 | Auth + billing working |
| Product Hunt launch | Month 4 | $800 | 30 | Demo video ready |
| $1K MRR | Month 5 | $1,000 | 40 | SEO content live |
| $5K MRR | Month 8 | $5,000 | 120 | Corporate channel opened |
| $10K MRR | Month 12 | $10,000 | 250 | Enterprise deals closing |
| $50K MRR | Month 24 | $50,000 | 1,000 | Series A or profitable |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Waldo copies open-source approach | Low | High | Open-source moat + enterprise licensing builds defensibility |
| face-recognition library accuracy insufficient | Medium | High | Benchmark against real event photos; upgrade to InsightFace if needed |
| GDPR facial data regulations tighten | Medium | High | Self-hosted tier already compliant; add consent flow to guest search |
| Stripe payment disputes / chargebacks | Low | Medium | Clear refund policy; event-level usage logging as evidence |
| R2 pricing changes (Cloudflare) | Low | Medium | Storage abstraction supports S3/MinIO fallback |
| Competitor acquires key market segment | Medium | Medium | Niche down to enterprise/self-hosted; open-source community locks in loyalty |

---

## Immediate Next Steps (This Week)

1. **Implement JWT auth** — blocker for all SaaS features
2. **Add Organization model** — enables multi-tenancy
3. **Create landing page** — start collecting waitlist emails before full launch
4. **Benchmark face-recognition accuracy** — must know the numbers before sales conversations
5. **Record demo video** — 90 seconds, shows selfie → results in real time
