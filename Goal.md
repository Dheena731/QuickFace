# QuickFace — Project Goals

> Last updated: 2026-06-08 — SaaS strategy defined  
> See: [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) | [SAAS_PLAN.md](SAAS_PLAN.md)

## Vision

QuickFace is an **AI photo delivery platform** for photographers and event studios available as both a managed SaaS and a self-hostable open-source product. Guests upload a single selfie to instantly retrieve every photo from an event in which they appear — no manual tagging, no account creation, no friction.

## Mission

Build the only event photo delivery platform that offers both a zero-friction cloud SaaS **and** a self-hostable option — so individual photographers, enterprises, and GDPR-bound institutions all have a path in. Compete on price, privacy, and tunable accuracy where incumbent SaaS platforms cannot follow.

---

## Core Objectives

### O1 — Reliable Photo Matching
Guests must reliably find their photos using only a selfie. False negatives (missed matches) and false positives (wrong person's photos) must be minimized through tuned similarity thresholds and quality preprocessing.

### O2 — Studio Self-Service
Photographers can create events, upload hundreds of photos, and share a guest search link — all without writing code or managing infrastructure manually.

### O3 — Production-Grade Reliability
The platform handles concurrent uploads, long-running face-processing jobs, and high guest traffic without data loss, race conditions, or downtime.

### O4 — Secure Multi-Tenant SaaS
Organizations are fully isolated. JWT authentication gates studio operations. Rate limiting prevents abuse. Billing enforces plan limits.

### O5 — Cost-Efficient at Scale
Storage uses Cloudflare R2 (zero egress fees). Async processing decouples upload from face extraction. Gross margin target: >95% at steady state.

### O6 — $10K MRR Within 12 Months of SaaS Launch
Grow to 250 paying customers across Starter, Professional, and Studio tiers. Close 3–5 enterprise self-hosted licenses annually.

---

## Success Metrics

| Metric | Target |
|---|---|
| Face match recall (true positive rate) | ≥ 90% |
| False positive rate per search | < 2% |
| Photo processing time (per photo, Celery worker) | < 5 seconds |
| Search API p95 latency | < 1 second |
| Upload batch success rate | ≥ 99.5% |
| Studio event creation flow | ≤ 60 seconds end-to-end |
| Monthly Recurring Revenue (12-month target) | $10,000 MRR |
| Customer count (12-month target) | 250 paying customers |
| Gross margin | > 95% |
| Free-to-paid conversion rate | > 8% |

---

## Non-Goals (current scope)

- Video processing or livestream face tracking
- Native mobile apps (web-first only)
- Social sharing or photo watermarking
- Competing with full CRM/studio management suites (Sprout Studio, Táve)
- Building proprietary AI models (use face-recognition library; upgrade to InsightFace if accuracy demands it)

---

## Current Status: **MVP Complete — UI Overhaul + SaaS Build**

The core pipeline (upload → process → search → deliver) is fully functional with Cloudflare R2 storage. The project is now focused on production hardening: security, reliability, and operational tooling.

### Completed
- [x] FastAPI backend with SQLAlchemy + pgvector
- [x] Celery async photo processing pipeline
- [x] Cloudflare R2 storage integration
- [x] Face detection and 128-dim embedding extraction
- [x] Cosine similarity search with IVFFlat index
- [x] Next.js studio dashboard and guest search UI
- [x] Docker Compose full-stack orchestration
- [x] CORS, connection pooling, upload size limits, logging

### Phase 2 Hardening + UI — Completed 2026-06-08
- [x] Rate limiting: upload (20/min), search (30/min) per IP
- [x] Similarity confidence threshold (40% default) filters low-quality results
- [x] Celery Beat schedules cleanup tasks (stale: hourly, failed: daily 03:00 UTC)
- [x] MinIO backend duplicate `delete()` method removed
- [x] Full "LENS" dark UI — aperture search, polaroid cards, film contact sheet, cinematic landing

### Planned (Phase 3+)
- [ ] Studio authentication (JWT or API key)
- [ ] Event and photo management (delete/archive)
- [ ] Test coverage (unit + integration)
- [ ] Admin analytics dashboard
- [ ] Redis caching for hot search results
- [ ] Event name/slug input validation + XSS guard
- [ ] Presigned URL expiry refresh logic
