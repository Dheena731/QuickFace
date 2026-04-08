# QuickFace — Project Analysis

> A comprehensive technical breakdown of the QuickFace codebase.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Directory Structure](#directory-structure)
4. [Backend (FastAPI)](#backend-fastapi)
   - [Configuration](#configuration)
   - [Database Models](#database-models)
   - [API Routes](#api-routes)
   - [Face Processing Pipeline](#face-processing-pipeline)
   - [Async Task Queue (Celery)](#async-task-queue-celery)
   - [Object Storage (MinIO)](#object-storage-minio)
   - [Cleanup Tasks](#cleanup-tasks)
   - [Rate Limiting](#rate-limiting)
   - [Logging](#logging)
5. [Frontend (Next.js)](#frontend-nextjs)
   - [Pages & Routing](#pages--routing)
   - [UI Components & Design](#ui-components--design)
   - [Dependencies](#frontend-dependencies)
6. [Infrastructure & Deployment](#infrastructure--deployment)
   - [Docker Compose](#docker-compose)
   - [Database Initialisation](#database-initialisation)
   - [Environment Variables](#environment-variables)
7. [Data Flow](#data-flow)
8. [Technology Stack Summary](#technology-stack-summary)
9. [Known Issues & Observations](#known-issues--observations)

---

## Project Overview

**QuickFace** is an open-source, self-hostable, AI-powered photo delivery platform for photographers and event studios. It solves a specific problem: after an event (wedding, conference, party), guests want their photos without having to scroll through hundreds of images taken by a professional.

**Core idea:** A guest uploads a single selfie → QuickFace finds and returns every photo from the event in which that guest appears.

**Version:** `0.1.0`  
**License:** MIT  
**Python:** ≥ 3.12  

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Guest / Studio                    │
│                      (Web Browser)                       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js Frontend                       │
│              (localhost:3000 / port 3000)                │
│  - Landing page                                          │
│  - /events/[eventId]/search  (guest selfie UI)           │
│  - /dashboard/events          (studio dashboard)         │
└────────────────────────┬────────────────────────────────┘
                         │ REST API calls (axios)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Backend (API)                    │
│              (localhost:8000 / port 8000)                │
│  POST /api/v1/events            → Create event           │
│  GET  /api/v1/events/{id}       → Get event              │
│  POST /api/v1/upload/{event_id} → Upload photos          │
│  POST /api/v1/search/{event_id} → Selfie face search     │
│  GET  /health                   → Health check           │
└────────┬──────────────────────────┬─────────────────────┘
         │ enqueue task             │ query / write
         ▼                         ▼
┌─────────────────┐     ┌──────────────────────────────────┐
│  Redis (broker) │     │  PostgreSQL + pgvector            │
│  (port 6379)    │     │  (port 5432)                      │
└────────┬────────┘     │  Tables:                         │
         │              │  - events                         │
         ▼              │  - photos                         │
┌─────────────────┐     │  - face_embeddings (vector(128)) │
│  Celery Worker  │─────┴──────────────────────────────────┘
│  (process_photo)│
│  Reads image    │───────────────────────────────────────┐
│  from MinIO     │                                       │
│  Runs face_rec  │     ┌──────────────────────────────────┤
│  Writes vectors │     │  MinIO (S3-compatible storage)   │
└─────────────────┘     │  (port 9000 / console: 9001)    │
                        │  Bucket: quickface-photos        │
                        └─────────────────────────────────┘
```

---

## Directory Structure

```
QuickFace/
├── .env                        # Local environment variables (gitignored)
├── .env.example                # Template for environment configuration
├── .python-version             # Pinned Python version (3.12)
├── pyproject.toml              # Python project metadata & dependencies
├── requirements.txt            # Pip-compatible dependency list
├── uv.lock                     # uv lockfile for reproducible installs
├── main.py                     # Entry-point shim (imports backend app)
├── backend.Dockerfile          # Docker image for API & Celery worker
├── frontend.Dockerfile         # Docker image for Next.js frontend
│
├── backend/
│   └── app/
│       ├── __init__.py
│       ├── main.py             # FastAPI app factory (CORS, routers)
│       ├── config.py           # Pydantic settings (env-driven)
│       ├── models.py           # SQLAlchemy ORM models
│       ├── schemas.py          # Pydantic request/response schemas
│       ├── dependencies.py     # DB session dependency injection
│       ├── celery_app.py       # Celery instance configuration
│       ├── tasks.py            # process_photo Celery task
│       ├── cleanup.py          # Stale/failed photo cleanup tasks
│       ├── rate_limiting.py    # slowapi rate limiter setup
│       ├── logging_config.py   # Rotating file + console logging
│       ├── face/
│       │   └── processor.py   # face_recognition wrapper
│       ├── routes/
│       │   ├── __init__.py
│       │   ├── event.py        # POST/GET /api/v1/events
│       │   ├── upload.py       # POST /api/v1/upload/{event_id}
│       │   └── search.py       # POST /api/v1/search/{event_id}
│       ├── storage/
│       │   ├── base.py         # Abstract StorageBackend
│       │   └── minio_backend.py # MinIO implementation
│       └── vector/             # (empty — reserved for future use)
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── next.config.mjs
│   └── app/
│       ├── layout.tsx          # Root layout (header, footer, nav)
│       ├── page.tsx            # Landing page
│       ├── globals.css         # Tailwind base styles + custom tokens
│       ├── (public)/
│       │   └── events/
│       │       └── [eventId]/  # Guest selfie search page
│       └── (studio)/
│           └── dashboard/
│               └── events/     # Studio event management dashboard
│
└── deploy/
    ├── docker-compose.yml      # Full-stack orchestration
    └── db/
        └── init.sql            # DB schema + pgvector indexes
```

---

## Backend (FastAPI)

### Configuration

**File:** `backend/app/config.py`

Settings are managed via **Pydantic Settings** (`pydantic-settings`) and loaded from the `.env` file. All values can be overridden by environment variables.

| Setting | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://quickface:quickface@db:5432/quickface` | PostgreSQL connection string |
| `REDIS_URL` | `redis://redis:6379/0` | Redis broker URL for Celery |
| `STORAGE_ENDPOINT` | `http://minio:9000` | S3-compatible endpoint (MinIO/R2/S3) |
| `STORAGE_ACCESS_KEY` | `minioadmin` | Object storage access key |
| `STORAGE_SECRET_KEY` | `minioadmin` | Object storage secret key |
| `STORAGE_BUCKET` | `quickface-photos` | Bucket name |
| `STORAGE_SECURE` | `False` | Use HTTPS for storage |
| `CORS_ORIGINS` | `[]` | Additional allowed CORS origins |
| `MAX_FILE_SIZE_MB` | `50` | Max size per uploaded photo |
| `MAX_UPLOAD_BATCH_MB` | `500` | Max total size per upload request |
| `MAX_SEARCH_RESULTS` | `500` | Max `top_k` for face search |
| `DB_POOL_SIZE` | `20` | SQLAlchemy connection pool size |
| `DB_MAX_OVERFLOW` | `10` | SQLAlchemy pool overflow limit |

Settings are cached with `@lru_cache()` for performance.

---

### Database Models

**File:** `backend/app/models.py`  
**ORM:** SQLAlchemy 2.x with `pgvector.sqlalchemy.Vector`

#### `Event`
| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | Auto-generated UUID4 |
| `name` | `VARCHAR(255)` | Required |
| `slug` | `VARCHAR(255)` | Optional, unique |
| `starts_at` / `ends_at` | `TIMESTAMP` | Optional event dates |
| `status` | `VARCHAR(32)` | `draft` / `active` / `archived` |
| `created_at` | `TIMESTAMP` | Auto set to `utcnow()` |

#### `Photo`
| Column | Type | Notes |
|---|---|---|
| `id` | `INTEGER` PK | Auto-increment |
| `event_id` | `UUID` FK → `events.id` | Cascades on delete |
| `storage_key` | `VARCHAR(512)` | Path in MinIO bucket, unique |
| `public_url` | `VARCHAR(1024)` | Optional presigned URL |
| `width` / `height` | `INTEGER` | Optional dimensions |
| `processing_status` | `VARCHAR(32)` | `pending` / `processing` / `processed` / `no_faces` / `failed` |
| `processed_at` | `TIMESTAMP` | Set when processing completes |
| `created_at` | `TIMESTAMP` | Auto set |

#### `FaceEmbedding`
| Column | Type | Notes |
|---|---|---|
| `id` | `INTEGER` PK | Auto-increment |
| `event_id` | `UUID` FK → `events.id` | For event-scoped queries |
| `photo_id` | `INTEGER` FK → `photos.id` | Cascades on delete |
| `face_index` | `INTEGER` | Zero-based index of face in photo |
| `embedding` | `vector(128)` | 128-dim face embedding (dlib) |
| `bbox` | `JSONB` | `{top, right, bottom, left}` bounding box |
| `created_at` | `TIMESTAMP` | Auto set |

---

### API Routes

**File:** `backend/app/routes/`

#### Events — `POST /api/v1/events`
- **Request body:** `{name, slug?, starts_at?, ends_at?}`
- **Response:** `EventOut` — returns created event with UUID
- **Status:** `201 Created`

#### Events — `GET /api/v1/events/{event_id}`
- **Validation:** UUID format check before DB query
- **Response:** `EventOut`
- **Errors:** `400` (invalid UUID), `404` (not found)

#### Upload — `POST /api/v1/upload/{event_id}`
- Accepts `multipart/form-data` with one or more files
- **Validation pipeline:**
  1. Verifies event exists
  2. Checks each file ≤ `MAX_FILE_SIZE_MB` (default 50 MB)
  3. Checks total batch ≤ `MAX_UPLOAD_BATCH_MB` (default 500 MB)
- **Upload flow** (transactional safety):
  1. Upload all files to MinIO first
  2. Create all DB photo records in one commit
  3. Enqueue `process_photo` Celery tasks **after** commit
  4. On failure: rollback DB, delete uploaded storage objects
- **Response:** `{event_id, uploaded: int, photo_ids: [int]}`

#### Search — `POST /api/v1/search/{event_id}`
- Accepts `multipart/form-data` with a single selfie file
- **Query param:** `top_k` (1–500, default 50)
- **Search pipeline:**
  1. Verifies event exists
  2. Extracts a single 128-dim face embedding from the selfie
  3. Runs `cosine_distance` query via pgvector against `face_embeddings` for that event
  4. Aggregates by photo (keeps best/lowest distance per photo)
  5. Hydrates `Photo` records, converts distance to similarity (`1.0 - distance`)
- **Response:** `SearchResponse { results: [{ photo, similarity }] }`
- Returns empty results (not an error) if no face is detected in the selfie

---

### Face Processing Pipeline

**File:** `backend/app/face/processor.py`  
**Library:** `face_recognition` (wrapper around dlib)

```python
# Core functions:

def extract_face_embeddings(image_bytes: bytes) -> List[DetectedFace]:
    # Loads image via Pillow (converts to RGB)
    # Detects face locations with face_recognition.face_locations()
    # Extracts 128-dim encodings with face_recognition.face_encodings()
    # Returns List[DetectedFace(embedding, bbox)]

def extract_single_embedding(image_bytes: bytes) -> List[float] | None:
    # Convenience wrapper — returns first face's embedding or None
```

**`DetectedFace` dataclass:**
```python
@dataclass
class DetectedFace:
    embedding: List[float]   # 128 floats (dlib face encoding)
    bbox: dict               # {top, right, bottom, left}
```

The embedding dimension is **128**, matching the `vector(128)` column in `face_embeddings`.

---

### Async Task Queue (Celery)

**File:** `backend/app/tasks.py`  
**Config:** `backend/app/celery_app.py`

- Celery app name: `quickface`
- Broker: Redis (`REDIS_URL`)
- Backend: Redis (for result storage)
- Default queue: `quickface`

#### `process_photo` Task
- **Name:** `quickface.process_photo`
- **Max retries:** 3 (exponential backoff: 1s, 2s, 4s)
- **Flow:**
  1. Fetch `Photo` from DB; mark as `PROCESSING`
  2. Retrieve image bytes from MinIO
  3. Run `extract_face_embeddings()`
  4. If no faces → mark as `NO_FACES`
  5. If faces found → insert `FaceEmbedding` rows, mark as `PROCESSED`
  6. On error → rollback, mark as `FAILED`, retry with backoff

---

### Object Storage (MinIO)

**Files:** `backend/app/storage/base.py`, `backend/app/storage/minio_backend.py`

An abstract `StorageBackend` class defines the interface:
```python
class StorageBackend:
    def upload(file_obj, key, content_type) -> str
    def get_url(key) -> str       # presigned URL (12h expiry)
    def open(key) -> bytes
    def delete(key) -> None
```

`MinioStorageBackend` implements this using the `minio` Python SDK:
- Uses multipart upload (`part_size=10MB`)
- Presigned URLs with 12-hour expiry
- Strips `http://` / `https://` from endpoint for SDK compatibility

> **Note:** The `delete` method is defined twice in `minio_backend.py` (lines 52–58). The second definition overrides the first — this is a minor code duplication bug.

Storage keys follow the pattern: `events/{event_id}/{uuid4}`

---

### Cleanup Tasks

**File:** `backend/app/cleanup.py`

Two Celery tasks for database hygiene:

| Task | Name | Default | Behaviour |
|---|---|---|---|
| `cleanup_stale_photos` | `quickface.cleanup_stale_photos` | 24 hours | Marks `PENDING` photos older than N hours as `FAILED` |
| `cleanup_failed_photos` | `quickface.cleanup_failed_photos` | 30 days | Deletes `FAILED` photos older than N days |

> **Note:** These tasks are defined but not scheduled via Celery Beat in the current `docker-compose.yml`. They would need to be triggered manually or via a beat schedule.

---

### Rate Limiting

**File:** `backend/app/rate_limiting.py`  
**Library:** `slowapi` (Starlette/FastAPI wrapper for limits)

A `setup_rate_limiting(app)` helper is defined to attach `slowapi`'s `Limiter` to the FastAPI app, but it is **not currently called** from `main.py`. Rate limiting is implemented but not active.

---

### Logging

**File:** `backend/app/logging_config.py`

Configures structured logging with two rotating file handlers:

| Handler | File | Max Size | Backups |
|---|---|---|---|
| Console | stdout | — | — |
| General | `logs/quickface.log` | 10 MB | 10 |
| Tasks | `logs/tasks.log` | 10 MB | 10 |

Format: `timestamp - name - level - func:line - message`

---

## Frontend (Next.js)

**Framework:** Next.js 14.2.10 (App Router)  
**Language:** TypeScript  
**Styling:** Tailwind CSS 3.4  
**HTTP Client:** axios 1.7.7  

### Pages & Routing

The frontend uses Next.js **App Router** with route groups:

```
app/
├── layout.tsx              → Root layout (navbar, footer)
├── page.tsx                → Landing page (/)
├── globals.css             → Global styles & utility tokens
│
├── (public)/               → Route group (no layout segment)
│   └── events/
│       └── [eventId]/      → Dynamic event segment
│           └── (page)      → Guest selfie search UI
│
└── (studio)/               → Route group (no layout segment)
    └── dashboard/
        └── events/         → Studio event management dashboard
```

| URL | Description |
|---|---|
| `/` | Landing page — hero section, how-it-works, feature cards |
| `/events/[eventId]/search` | Guest-facing selfie upload & photo results |
| `/dashboard/events` | Studio dashboard — create events, upload photos |
| `/events/demo/search` | Hardcoded demo link for testing the guest flow |

### UI Components & Design

- **Root Layout** (`layout.tsx`): Top navigation bar with QuickFace logo (`QF` badge with emerald→sky gradient), links to Guest demo and Dashboard, a footer with the tech stack attribution.
- **Landing Page** (`page.tsx`): Two-column hero with CTA buttons, "how it works" numbered steps, feature cards for Guest / Studio / Self-host flows.
- **Design system** (`globals.css`): Custom Tailwind utility classes such as `.btn-primary`, `.btn-secondary`, `.glass` (glassmorphism), `.status-chip`.

### Frontend Dependencies

| Package | Version | Role |
|---|---|---|
| `next` | 14.2.10 | React framework |
| `react` / `react-dom` | 18.3.1 | UI library |
| `axios` | ^1.7.7 | HTTP client for API calls |
| `tailwindcss` | ^3.4.17 | Utility-first CSS |
| `typescript` | ^5.7.0 | Type safety |
| `eslint` | 8.57.0 | Linting |

---

## Infrastructure & Deployment

### Docker Compose

**File:** `deploy/docker-compose.yml`

Six services in one `docker-compose up --build`:

| Service | Image / Build | Port(s) | Description |
|---|---|---|---|
| `db` | `ankane/pgvector` | `5432` | PostgreSQL with pgvector extension |
| `redis` | `redis:7` | `6379` | Celery broker & result backend |
| `minio` | `minio/minio` | `9000`, `9001` | S3-compatible object storage + console |
| `api` | `backend.Dockerfile` | `8000` | FastAPI application server |
| `worker` | `backend.Dockerfile` | — | Celery worker (`-Q quickface`) |
| `frontend` | `frontend.Dockerfile` | `3000` | Next.js server |

`api` and `worker` share the same Dockerfile but differ in the startup command:
- **api:** defaults to `uvicorn` (defined in Dockerfile)
- **worker:** overrides with `celery -A app.tasks worker --loglevel=info -Q quickface`

Both `api` and `worker` depend on `db`, `redis`, and `minio`.

### Database Initialisation

**File:** `deploy/db/init.sql`

Runs on first container start. Creates:
1. `vector` extension (pgvector)
2. `events`, `photos`, `face_embeddings` tables
3. Two indexes on `face_embeddings`:
   - `idx_face_embeddings_event_id` — B-Tree on `event_id` for event scoping
   - `idx_face_embeddings_embedding_ann` — **IVFFlat** index (`vector_cosine_ops`, `lists=100`) for approximate nearest-neighbour cosine search

### Environment Variables

**File:** `.env.example`

Copy to `.env` before running. Key variables:

```bash
ENVIRONMENT=development
DATABASE_URL=postgresql+psycopg2://quickface:quickface@db:5432/quickface
REDIS_URL=redis://redis:6379/0

# Storage (MinIO local or R2/S3 for production)
STORAGE_ENDPOINT=http://minio:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=quickface-photos
STORAGE_SECURE=0

# Constraints
MAX_FILE_SIZE_MB=50
MAX_UPLOAD_BATCH_MB=500
MAX_SEARCH_RESULTS=500

# DB pool
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10

# Frontend
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

---

## Data Flow

### Studio Upload Flow

```
Studio → POST /api/v1/upload/{event_id} (multipart files)
         │
         ├─ Validate files (size checks)
         ├─ Upload all to MinIO (events/{event_id}/{uuid4})
         ├─ Create Photo records in DB (status=PENDING)
         ├─ COMMIT DB
         └─ Enqueue process_photo.delay(photo.id) per photo
                  │
         [Celery Worker]
                  ├─ Fetch Photo from DB
                  ├─ Mark status=PROCESSING
                  ├─ Get image bytes from MinIO
                  ├─ face_recognition.face_locations() → locations
                  ├─ face_recognition.face_encodings() → 128-dim vectors
                  ├─ Insert FaceEmbedding rows into DB
                  └─ Mark status=PROCESSED (or NO_FACES / FAILED)
```

### Guest Search Flow

```
Guest → POST /api/v1/search/{event_id} (selfie file)
         │
         ├─ Verify event exists
         ├─ extract_single_embedding(selfie_bytes) → 128-dim vector
         ├─ pgvector cosine_distance query (scoped to event_id)
         │    SELECT face_embeddings, cosine_distance(embedding, $query)
         │    WHERE event_id = $event_id
         │    ORDER BY distance ASC
         │    LIMIT top_k
         ├─ Aggregate: best distance perPhoto
         ├─ Hydrate Photo objects
         └─ Return [{photo, similarity}] sorted by similarity desc
```

---

## Technology Stack Summary

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python 3.12), Uvicorn, Pydantic v2 |
| **Face Recognition** | `face_recognition` library (dlib under the hood) |
| **Async Workers** | Celery 5, Redis 7 |
| **Database** | PostgreSQL + pgvector extension |
| **ORM** | SQLAlchemy 2 + pgvector-python |
| **Object Storage** | MinIO (S3-compatible, swappable for AWS S3 / Cloudflare R2) |
| **Containerisation** | Docker, Docker Compose |
| **Dependency Management** | `uv` (lock file) + `pyproject.toml` |
| **Rate Limiting** | slowapi (configured, not yet active) |
| **QR Code** | `qrcode[pil]` (dependency present, usage TBD) |

---

## Known Issues & Observations

| # | Severity | Location | Description |
|---|---|---|---|
| 1 | Low | `storage/minio_backend.py` L52–58 | `delete()` is defined **twice** — second definition silently overrides first. Safe to remove the duplicate. |
| 2 | Medium | `backend/app/main.py` | `rate_limiting.setup_rate_limiting()` is imported but **never called**. Rate limiting is non-functional until wired up. |
| 3 | Medium | `deploy/docker-compose.yml` | Cleanup tasks (`cleanup_stale_photos`, `cleanup_failed_photos`) are not scheduled via Celery Beat. They must be triggered manually or a beat schedule added. |
| 4 | Low | `backend/app/vector/` | `vector/` directory is empty — likely a placeholder for future vector DB abstraction logic. |
| 5 | Low | `backend/app/schemas.py` | `EventOut` and `PhotoOut` use `orm_mode = True` (Pydantic v1 style). In Pydantic v2 this should be `model_config = ConfigDict(from_attributes=True)`. |
| 6 | Info | `frontend/app/page.tsx` L17 | Guest demo link hardcodes `/events/demo/search` — a non-existent event in a fresh install; useful for quick testing but will 404 on the API. |
| 7 | Info | Storage | The `get_url()` method generates presigned URLs (12h expiry) but `Photo.public_url` is never populated by any current code path. Photo URLs are generated on-demand rather than stored. |

---

*Generated on 2026-04-07 by project analysis.*
