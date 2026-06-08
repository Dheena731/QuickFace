# QuickFace — Development Roadmap

> Last updated: 2026-06-08 (SaaS strategy added)  
> Current phase: **Phase 3 — Multi-Tenant Auth (SaaS blocker)**  
> See: [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) | [SAAS_PLAN.md](SAAS_PLAN.md) | [Goal.md](Goal.md)

---

## Phase 1 — MVP Core ✅ COMPLETE

All core pipeline features shipped. The app can receive photos, detect faces, store embeddings, and serve guest search results.

| Task | Status | Notes |
|---|---|---|
| FastAPI backend skeleton | ✅ Done | Routes: event, upload, search |
| PostgreSQL + pgvector schema | ✅ Done | IVFFlat cosine index |
| Celery async worker pipeline | ✅ Done | Redis broker |
| face-recognition embedding extraction | ✅ Done | 128-dim vectors |
| Cloudflare R2 storage backend | ✅ Done | Zero egress cost |
| Next.js studio dashboard | ✅ Done | Create events, copy guest links |
| Guest selfie search UI | ✅ Done | Upload selfie → see matching photos |
| Docker Compose orchestration | ✅ Done | db, redis, api, worker, frontend |
| CORS middleware | ✅ Done | Frontend ↔ API communication |
| Upload size validation | ✅ Done | 50MB per file, 500MB per batch |
| DB connection pooling | ✅ Done | Pool=20, pre-ping, 1hr recycle |
| Structured logging | ✅ Done | Rotating file + JSON logger |

---

## Phase 2 — Production Hardening + UI Overhaul ✅ COMPLETE

Closing known bugs and wiring up security and reliability infrastructure that was built but not connected.

| Task | Status | Priority | Notes |
|---|---|---|---|
| Fix MinIO duplicate `delete()` bug | ✅ Done | High | Silent method override fixed |
| Enable rate limiting on upload route | ✅ Done | High | 20 uploads/min per IP |
| Enable rate limiting on search route | ✅ Done | High | 30 searches/min per IP |
| Add similarity confidence threshold | ✅ Done | Medium | Min 40% similarity filter |
| Schedule Celery Beat cleanup tasks | ✅ Done | Medium | Stale=24h, failed=30d |
| Full dark "LENS" UI redesign | ✅ Done | High | Cinematic dark theme, all 6 pages |
| Input sanitization on event names | 🔲 Todo | Medium | Slug validation + XSS guard |
| Presigned URL expiry handling | 🔲 Todo | Medium | Refresh before serving to guests |
| Event deletion endpoint | 🔲 Todo | Medium | Studio can remove events |
| Photo deletion endpoint | 🔲 Todo | Low | Remove individual photos |

---

## Phase 3 — Multi-Tenant Auth (SaaS Blocker) 🔄 NEXT UP

The single biggest gap before SaaS launch. Without this, anyone can create events and access any event. Must be completed before billing.

| Task | Status | Priority | Notes |
|---|---|---|---|
| `Organization` model (tenant) | 🔲 Todo | Critical | UUID PK, name, slug, created_at |
| `User` model + bcrypt passwords | 🔲 Todo | Critical | email, hashed_password, org_id |
| JWT auth: register / login / refresh | 🔲 Todo | Critical | Access token 15min, refresh 7d |
| Event ownership FK + enforcement | 🔲 Todo | Critical | All routes check org_id |
| `current_user` dependency injection | 🔲 Todo | Critical | FastAPI Depends pattern |
| Frontend: /login and /register pages | 🔲 Todo | Critical | HttpOnly cookie JWT storage |
| Frontend: authenticated route guard | 🔲 Todo | High | Redirect unauthenticated users |
| Guest search stays anonymous | 🔲 Todo | High | Only studio routes need auth |
| Audit logging (who did what) | 🔲 Todo | Medium | Security/compliance |

---

## Phase 3b — Billing & Plan Enforcement 🔲 PLANNED (after auth)

| Task | Status | Priority | Notes |
|---|---|---|---|
| Stripe Checkout integration | 🔲 Todo | Critical | Starter / Pro / Studio tiers |
| `Subscription` model | 🔲 Todo | Critical | tier, status, stripe IDs |
| Stripe webhook handler | 🔲 Todo | Critical | subscription created/updated/deleted |
| Plan limit middleware | 🔲 Todo | High | Enforce photo count, event count |
| Billing dashboard page | 🔲 Todo | High | Upgrade, cancel, invoice history |
| Free tier (no credit card) | 🔲 Todo | High | 1 event, 200 photos, 100 searches |

---

## Phase 3c — Branding & Custom Domains 🔲 PLANNED

| Task | Status | Priority | Notes |
|---|---|---|---|
| Per-event logo + color customization | 🔲 Todo | High | CSS variables on guest search page |
| Custom subdomain support | 🔲 Todo | Medium | events.yourstudio.com → QuickFace |
| White-label guest page (Studio tier) | 🔲 Todo | Medium | Remove QuickFace branding entirely |
| Event analytics (searches, match rate) | 🔲 Todo | Medium | Studio dashboard charts |

---

## Phase 4 — Performance & Scale 🔲 PLANNED

Optimize for high concurrency and larger datasets.

| Task | Status | Priority | Notes |
|---|---|---|---|
| Redis caching for hot search results | 🔲 Todo | High | Cache top-K per selfie hash |
| pgvector HNSW index migration | 🔲 Todo | High | Faster than IVFFlat at scale |
| Batch embedding processing | 🔲 Todo | Medium | Multi-face photos in one pass |
| Celery worker auto-scaling | 🔲 Todo | Medium | Dynamic concurrency |
| CDN integration for photo delivery | 🔲 Todo | Medium | Reduce R2 request costs |
| Search result pagination | 🔲 Todo | Low | Handle events with 1000s of photos |

---

## Phase 5 — Developer Experience & Testing 🔲 PLANNED

Make the project trustworthy for contributors and operators.

| Task | Status | Priority | Notes |
|---|---|---|---|
| Unit tests for face/search logic | 🔲 Todo | High | pytest + mock storage |
| Integration tests for API routes | 🔲 Todo | High | TestClient + real DB |
| E2E tests for guest search flow | 🔲 Todo | Medium | Playwright |
| CI pipeline (GitHub Actions) | 🔲 Todo | High | Lint + test on PR |
| API documentation (Swagger/OpenAPI) | 🔲 Todo | Medium | Auto-generated via FastAPI |
| Deployment guide (production) | 🔲 Todo | Medium | Beyond docker-compose dev |

---

## Phase 6 — Studio Features 🔲 FUTURE

Quality-of-life features for photographers managing events.

| Task | Status | Priority | Notes |
|---|---|---|---|
| Event dashboard with photo stats | 🔲 Todo | Medium | Processing status overview |
| Guest access analytics | 🔲 Todo | Low | How many guests searched |
| Photo download as ZIP | 🔲 Todo | Low | Bulk download for guests |
| Event branding customization | 🔲 Todo | Low | Logo, colors per event |
| QR code generator for guest link | 🔲 Todo | Low | Print and display at events |

---

## Known Bugs & Tech Debt

| Bug | File | Severity | Status |
|---|---|---|---|
| MinIO `delete()` duplicate method | [backend/app/storage/minio_backend.py](backend/app/storage/minio_backend.py) | High | ✅ Fixed |
| Rate limiting not wired to routes | [backend/app/main.py](backend/app/main.py) | High | ✅ Fixed |
| Cleanup tasks not scheduled | [backend/app/celery_app.py](backend/app/celery_app.py) | Medium | ✅ Fixed |
| No similarity threshold in search | [backend/app/routes/search.py](backend/app/routes/search.py) | Medium | ✅ Fixed |
| No event name/slug validation | [backend/app/schemas.py](backend/app/schemas.py) | Medium | 🔲 Todo |
| Presigned URLs expire after 12h | [backend/app/storage/r2_backend.py](backend/app/storage/r2_backend.py) | Medium | 🔲 Todo |

---

## SaaS Pricing Tiers

| Tier | Price | Events/mo | Photos/event | Searches/mo | Branding |
|---|---|---|---|---|---|
| Free | $0 | 1 | 200 | 100 | QuickFace badge |
| Starter | $29/mo or $19/event | 5 | 2,000 | 500 | QuickFace badge |
| Professional | $79/mo | Unlimited | 10,000 | Unlimited | Custom logo/colors |
| Studio | $199/mo | Unlimited | 50,000 | Unlimited | Full white-label |
| Enterprise | $2,000/yr | Unlimited | Unlimited | Unlimited | Self-hosted |

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-08 | Initial Roadmap.md created; Phase 2 hardening in progress |
| 2026-06-08 | Fixed MinIO duplicate delete() method |
| 2026-06-08 | Enabled rate limiting on upload (20/min) and search (30/min) routes |
| 2026-06-08 | Added 40% similarity confidence threshold to search results |
| 2026-06-08 | Scheduled Celery Beat cleanup tasks (stale: 24h, failed: 30 days) |
| 2026-06-08 | Competitive analysis completed — 15 competitors mapped |
| 2026-06-08 | SaaS business plan defined: 4 tiers, GTM strategy, 6-sprint build plan |
| 2026-06-08 | Roadmap updated: Phase 3 = multi-tenant auth + billing (SaaS blockers) |
| 2026-06-08 | Full "LENS" UI overhaul: dark cinematic theme, aperture search zone, polaroid cards, film contact sheet, feature ticker, floating gradient orbs |
