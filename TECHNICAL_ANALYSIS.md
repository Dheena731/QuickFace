# QuickFace: Cloudflare R2 Assessment + Code Issues

## Part 1: Cloudflare R2 Migration Analysis

### Should You Switch from MinIO to Cloudflare R2?

#### **SHORT ANSWER: YES, likely a good idea for production** ✅

---

### Comparison Table

| Criterion | MinIO (Current) | Cloudflare R2 |
|-----------|-----------------|---------------|
| **Cost (Storage)** | ~$0.015/GB/month | ~$0.015/GB/month |
| **Egress Bandwidth** | ❌ **Charged** ($0.10-0.20/GB) | ✅ **FREE** (🎯 Huge savings!) |
| **Setup** | Docker container (ops overhead) | Cloud service (managed) |
| **S3 Compatibility** | ✅ Fully compatible | ✅ 99% compatible |
| **Data Residency** | Local/private | Cloudflare edge |
| **Uptime SLA** | Self-managed | 99.9% guaranteed |
| **Integration** | Built-in to compose | Change endpoint + keys |
| **Cold Start** | None (local) | Negligible |
| **Compliance** | GDPR-friendly (local) | GDPR-friendly (EU option) |

---

### GOOD REASONS to Switch to R2:

#### 1. **Enormous Bandwidth Cost Savings**
   - **Scenario:** Event with 1,000 guests downloading 500MB photos each = 500TB egress
   - **With S3:** 500TB × $0.10/GB = **$5,000 USD/month** 😱
   - **With R2:** 500TB × $0 = **$0/month** 🎉
   - This alone can justify R2 for any production photo delivery business

#### 2. **Zero Operations Overhead**
   - No need to manage MinIO docker service
   - No MinIO console UI to maintain
   - Cloudflare handles backups, replication, durability
   - Frees your DevOps for other work

#### 3. **Automatic Scaling**
   - R2 scales instantly (no capacity planning)
   - MinIO requires manual scaling or Docker orchestration

#### 4. **Global CDN Integration**
   - Presigned URLs can use Cloudflare's edge network
   - Faster photo delivery to guests worldwide

#### 5. **Better Durability**
   - R2 replicates across multiple datacenters by default
   - MinIO local storage = single point of failure

#### 6. **Integration is Easy**
   - Code already uses S3-compatible minio SDK
   - Only change: endpoint URL + credentials
   - No code changes needed!

```python
# Current (MinIO)
STORAGE_ENDPOINT=http://minio:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin

# Proposed (R2)
STORAGE_ENDPOINT=https://youraccount.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY=your_r2_access_key
STORAGE_SECRET_KEY=your_r2_secret_key
```

---

### REASONS to KEEP MinIO:

#### 1. **On-Premise/Air-Gapped Requirements**
   - If you must keep data 100% local for compliance/security

#### 2. **Regulatory Data Residency**
   - Some industries require data to never leave a jurisdiction
   - R2 can be configured regionally, but MinIO is more flexible

#### 3. **Cost if Low Egress**
   - If guests mostly download locally (<1TB/month)
   - MinIO ops cost ≈ one server; R2 = $0 anyway

#### 4. **Hybrid Multi-Cloud**
   - If you need provider independence (avoid lock-in)

---

### Recommendation Roadmap:

```
DEVELOPMENT:     Keep MinIO (easy local testing)
                 ↓
STAGING:         Switch to R2 (test real costs, latency)
                 ↓
PRODUCTION:      Use R2 + MinIO as backup (failover strategy)
```

---

## Part 2: Critical Code Issues Found

### 🔴 CRITICAL ISSUES

#### **Issue #1: No File Size Validation**
**Location:** [backend/app/routes/upload.py](backend/app/routes/upload.py#L15-L40)

**Problem:**
```python
async def upload_photos(
    event_id: str,
    files: List[UploadFile] = File(...),  # ⚠️ No max file size!
    db: Session = Depends(get_db),
):
```

**Risk:**
- Guest uploads 5GB file → API crashes or OOMs
- Denial of service vulnerability
- Unbounded memory usage in FastAPI

**Fix:**
```python
from fastapi import File, UploadFile, status, HTTPException

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB per photo
MAX_TOTAL = 500 * 1024 * 1024     # 500MB per upload batch

@router.post("/{event_id}")
async def upload_photos(
    event_id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    total_size = 0
    for upload in files:
        size = len(await upload.read())
        await upload.seek(0)  # Reset for actual upload
        
        if size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large: {size/(1024*1024):.1f}MB (max: {MAX_FILE_SIZE/(1024*1024)}MB)"
            )
        total_size += size
    
    if total_size > MAX_TOTAL:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Total upload too large: {total_size/(1024*1024):.1f}MB"
        )
```

---

#### **Issue #2: Silent Exception Swallowing in Celery**
**Location:** [backend/app/tasks.py](backend/app/tasks.py#L46)

**Problem:**
```python
except Exception:  # ⚠️ Catches EVERYTHING, logs NOTHING
    db.rollback()
    photo.processing_status = PhotoProcessingStatusEnum.FAILED.value
    db.commit()
```

**Risk:**
- Task fails silently → no error logs → impossible to debug
- Face extraction errors disappear
- Database errors disappear
- You won't know why photos aren't being processed

**Fix:**
```python
import logging

logger = logging.getLogger(__name__)

@celery_app.task(name="quickface.process_photo", bind=True, max_retries=3)
def process_photo(self, photo_id: int) -> None:
    db: Session = SessionLocal()
    storage = MinioStorageBackend()
    try:
        photo: Photo | None = db.query(Photo).filter(Photo.id == photo_id).first()
        if photo is None:
            logger.warning(f"Photo not found: {photo_id}")
            return
        
        # ... processing code ...
        
    except Exception as exc:
        logger.exception(f"Failed processing photo {photo_id}", extra={"task_id": self.request.id})
        db.rollback()
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if photo is not None:
            photo.processing_status = PhotoProcessingStatusEnum.FAILED.value
            db.commit()
        
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
```

---

#### **Issue #3: Missing CORS Configuration**
**Location:** [backend/app/main.py](backend/app/main.py)

**Problem:**
```python
def create_app() -> FastAPI:
    app = FastAPI(title="QuickFace API", version="0.1.0")
    # ⚠️ No CORSMiddleware added!
```

**Risk:**
- Frontend at `localhost:3000` cannot call API at `localhost:8000`
- Browser blocks requests (Same-Origin Policy)
- `cors_origins` config is defined but never used!

**Current Behavior:** CORS blocked in production:
```
Access to XMLHttpRequest from 'https://photos.example.com:3000'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present...
```

**Fix:**
```python
from fastapi.middleware.cors import CORSMiddleware

def create_app() -> FastAPI:
    app = FastAPI(title="QuickFace API", version="0.1.0")

    settings = get_settings()
    
    # Add CORS middleware
    allowed_origins = [
        "http://localhost:3000",      # Dev
        "http://localhost:8000",      # Dev API
        "http://localhost:9000",      # MinIO console
    ]
    
    if settings.cors_origins:
        allowed_origins.extend([str(o) for o in settings.cors_origins])
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # ... rest of setup
```

---

### 🟡 HIGH-PRIORITY ISSUES

#### **Issue #4: No Input Validation on Event IDs**
**Location:** [backend/app/routes/upload.py:21](backend/app/routes/upload.py#L21), [search.py:22](backend/app/routes/search.py#L22)

**Problem:**
```python
@router.post("/{event_id}")
async def upload_photos(event_id: str, ...):  # ⚠️ Accept ANY string
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
```

**Risk:**
- User types garbage event ID → queries run anyway
- SQL injection via path parameter (though mitigated by ORM)
- No clear error message; returns 404 instead of 400 Bad Request

**Fix:**
```python
from uuid import UUID as PyUUID
from pydantic import validator

@router.post("/{event_id}")
async def upload_photos(
    event_id: PyUUID,  # Validates UUID format automatically
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found. Check the event ID is correct."
        )
```

---

#### **Issue #5: No Photo URL Generation**
**Location:** [backend/app/models.py](backend/app/models.py#L52)

**Problem:**
```python
class Photo(Base):
    __tablename__ = "photos"
    
    storage_key = Column(String(512), nullable=False, unique=True)
    public_url = Column(String(1024), nullable=True)  # ⚠️ Always NULL!
```

Frontend tries to display photos:
```tsx
{item.photo.public_url ? (
    <img src={item.photo.public_url} alt="Match" />
) : (
    <div>No image URL</div>  // Always shows this!
)}
```

**Risk:**
- Guests never see matching photos!
- Feature is completely broken in frontend
- Photo gallery is empty

**Root Cause:**
- Photos are stored in MinIO but `public_url` is never populated
- After processing, code doesn't call `storage.get_url()`

**Fix:**

In [tasks.py](backend/app/tasks.py):
```python
from .storage.minio_backend import MinioStorageBackend

@celery_app.task(name="quickface.process_photo")
def process_photo(photo_id: int) -> None:
    db: Session = SessionLocal()
    storage = MinioStorageBackend()
    try:
        photo: Photo | None = db.query(Photo).filter(Photo.id == photo_id).first()
        if photo is None:
            return

        photo.processing_status = PhotoProcessingStatusEnum.PROCESSING.value
        db.commit()

        image_bytes = storage.open(photo.storage_key)
        faces = extract_face_embeddings(image_bytes)

        if not faces:
            photo.processing_status = PhotoProcessingStatusEnum.NO_FACES.value
            photo.processed_at = datetime.utcnow()
            db.commit()
            return

        for idx, face in enumerate(faces):
            embedding = FaceEmbedding(
                event_id=photo.event_id,
                photo_id=photo.id,
                face_index=idx,
                embedding=face.embedding,
                bbox=face.bbox,
            )
            db.add(embedding)

        photo.processing_status = PhotoProcessingStatusEnum.PROCESSED.value
        photo.processed_at = datetime.utcnow()
        
        # ✅ ADD THIS: Generate presigned URL for guest access
        photo.public_url = storage.get_url(photo.storage_key)
        
        db.commit()
    except Exception as exc:
        logger.exception(f"Photo processing failed: {photo_id}")
        db.rollback()
        # ... error handling
```

---

#### **Issue #6: Race Condition in Upload**
**Location:** [backend/app/routes/upload.py:28-42](backend/app/routes/upload.py#L28-42)

**Problem:**
```python
for upload in files:
    key = f"events/{event_id}/{uuid.uuid4()}"
    storage.upload(upload.file, key, content_type=upload.content_type)  # ← Can fail silently
    
    photo = models.Photo(
        event_id=event.id,
        storage_key=key,
    )
    db.add(photo)  # ← DB record added...
    created.append(photo)

db.commit()  # ← If upload failed, DB is out of sync with storage!
for photo in created:
    db.refresh(photo)
    process_photo.delay(photo.id)  # ← Task tries to process non-existent file!
```

**Risk:**
- Photo is in DB but not in MinIO
- Celery task tries to open missing file → crashes
- Guest searches and sees photo that doesn't exist

**Fix:**
```python
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from .. import models
from ..dependencies import get_db
from ..storage.minio_backend import MinioStorageBackend
from ..tasks import process_photo

router = APIRouter()

@router.post("/{event_id}")
async def upload_photos(
    event_id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    storage = MinioStorageBackend()
    created = []
    uploaded_keys = []

    try:
        for upload in files:
            key = f"events/{event_id}/{uuid.uuid4()}"
            
            # ✅ Upload FIRST, before DB commit
            try:
                storage.upload(upload.file, key, content_type=upload.content_type)
                uploaded_keys.append(key)
            except Exception as e:
                # If storage fails, skip this file and continue
                logger.error(f"Failed to upload {key}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Storage upload failed: {str(e)}"
                )

            # ✅ Only create DB record AFTER successful upload
            photo = models.Photo(
                event_id=event.id,
                storage_key=key,
            )
            db.add(photo)
            created.append(photo)

        # ✅ Commit all DB records together
        db.commit()
        
        # ✅ Enqueue tasks AFTER transactions succeed
        for photo in created:
            db.refresh(photo)
            process_photo.delay(photo.id)

        return {
            "event_id": event_id,
            "uploaded": len(created),
            "photo_ids": [p.id for p in created],
        }
    
    except Exception as exc:
        # ✅ Rollback DB if anything fails
        db.rollback()
        
        # ✅ Clean up uploaded files that are now orphaned
        for key in uploaded_keys:
            try:
                storage.delete(key)
            except Exception as cleanup_err:
                logger.error(f"Failed to clean up {key}: {cleanup_err}")
        
        raise
```

Also need to add `delete()` to [backend/app/storage/minio_backend.py](backend/app/storage/minio_backend.py):
```python
def delete(self, key: str) -> None:
    self._client.remove_object(self._bucket, key)
```

---

#### **Issue #7: Missing Database Connection Pooling**
**Location:** [backend/app/dependencies.py](backend/app/dependencies.py#L11)

**Problem:**
```python
engine = create_engine(settings.database_url, future=True)
# ⚠️ Default pool_size=5, max_overflow=10 (too small for production)
```

**Risk:**
- With 100+ concurrent guest searches → connection pool exhausted
- Requests wait for connection → slow or timeout
- Database connection limit hit → new connections rejected

**Fix:**
```python
from sqlalchemy import create_engine, pool

engine = create_engine(
    settings.database_url,
    future=True,
    poolclass=pool.QueuePool,
    pool_size=20,              # Increase for production (guests)
    max_overflow=10,           # Allow bursts
    pool_pre_ping=True,        # Reconnect if connection dropped
    pool_recycle=3600,         # Recycle connections every hour
)
```

---

### 🟠 MEDIUM-PRIORITY ISSUES

#### **Issue #8: No Search Query Validation (`top_k` parameter)**
**Location:** [backend/app/routes/search.py:15-36](backend/app/routes/search.py#L15-36)

**Problem:**
```python
async def search_by_selfie(
    event_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    top_k: int = 50,  # ⚠️ No bounds check!
):
    # ...
    .limit(top_k)  # If top_k=1000000, returns 1M rows!
```

**Risk:**
- Guest passes `?top_k=999999` → API fetches millions of rows
- Memory explosion → API crashes
- Denial of service

**Fix:**
```python
from typing import Annotated
from fastapi import Query

async def search_by_selfie(
    event_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    top_k: Annotated[int, Query(ge=1, le=500)] = 50,  # ✅ Bounds check
):
```

---

#### **Issue #9: No Logging Setup**
**Problem:**
- No centralized logging configuration
- When things fail in production, no audit trail
- `except Exception: pass` silently failures

**Risk:**
- Impossible to debug issues after they happen
- No performance metrics
- No visibility into guest activity

**Fix:** Create [backend/app/logging_config.py](backend/app/logging_config.py):
```python
import logging
import logging.handlers
from pythonjsonlogger import jsonlogger

def setup_logging():
    # JSON logging for production
    logHandler = logging.handlers.RotatingFileHandler(
        "quickface.log",
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    
    formatter = jsonlogger.JsonFormatter()
    logHandler.setFormatter(formatter)
    
    logger = logging.getLogger("quickface")
    logger.addHandler(logHandler)
    logger.setLevel(logging.INFO)
```

---

#### **Issue #10: Missing Event Isolation Test**
**Risk:**
- Guest A searches Event #123
- Code needs to prevent returning photos from Event #124
- Current code filters by `event_id` but no test coverage

**Recommendation:** Add integration test:
```python
def test_search_isolation(db):
    # Create two events
    event1 = Event(id=uuid4(), name="Wedding")
    event2 = Event(id=uuid4(), name="Corporate")
    db.add_all([event1, event2])
    db.commit()
    
    # Add photos to each
    photo1 = Photo(event_id=event1.id, storage_key="...")
    photo2 = Photo(event_id=event2.id, storage_key="...")
    db.add_all([photo1, photo2])
    db.commit()
    
    # Search event 1, should NOT return photo2
    response = client.post(f"/api/v1/search/{event1.id}", ...)
    assert all(r["photo"]["event_id"] == str(event1.id) for r in response.json()["results"])
```

---

### 🔵 BUSINESS LOGIC ISSUES

#### **Issue #11: No Rate Limiting**
**Risk:**
- Attacker runs 10,000 searches per second
- Each search runs expensive pgvector query
- Database gets hammered → legitimate guests blocked

**Fix:** Add rate limiting middleware:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@router.post("/{event_id}")
@limiter.limit("5/minute")  # 5 searches per minute per IP
async def search_by_selfie(...):
    ...
```

---

#### **Issue #12: No Cleanup for Orphaned Photos**
**Risk:**
- Photo uploaded but never processed (worker crashed)
- Stays in `PENDING` state forever
- Guest sees incomplete results

**Recommendation:** Add periodic cleanup task:
```python
@celery_app.task
def cleanup_stale_photos():
    """Mark photos as FAILED if pending for >24 hours"""
    cutoff = datetime.utcnow() - timedelta(hours=24)
    
    stale = db.query(Photo).filter(
        Photo.processing_status == PhotoProcessingStatusEnum.PENDING.value,
        Photo.created_at < cutoff
    ).all()
    
    for photo in stale:
        photo.processing_status = PhotoProcessingStatusEnum.FAILED.value
        db.add(photo)
    
    db.commit()
```

---

#### **Issue #13: Frontend Missing Error Boundary**
**Location:** [frontend/app/(public)/events/[eventId]/search/page.tsx](frontend/app/%28public%29/events/%5BeventId%5D/search/page.tsx#L35-45)

**Problem:**
```jsx
const res = await fetch(`${apiBase}/api/v1/search/${params.eventId}`, {...});
if (!res.ok) {
    throw new Error(`Search failed with status ${res.status}`);  // ⚠️ No error details
}
```

**Risk:**
- Network timeout crashes page
- Malformed JSON response crashes page
- No user-friendly error messages

**Fix:**
```tsx
async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResults([]);

    const form = new FormData();
    form.append("file", file);

    try {
        const res = await fetch(`${apiBase}/api/v1/search/${params.eventId}`, {
            method: "POST",
            body: form,
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const detail = errorData.detail || `Search failed (${res.status})`;
            throw new Error(detail);
        }
        
        const data = await res.json();
        setResults(data.results ?? []);
    } catch (err: any) {
        // More helpful error messages
        if (err instanceof TypeError) {
            setError("Network error. Check API base URL and connectivity.");
        } else {
            setError(err.message ?? "Search failed");
        }
        console.error("Search error:", err);
    } finally {
        setLoading(false);
    }
}
```

---

## Summary: Issues by Severity

| # | Issue | Severity | Impact | Fix Time |
|---|-------|----------|--------|----------|
| 1 | No file size validation | 🔴 Critical | DoS / Crash | 15 min |
| 2 | Silent exception swallowing | 🔴 Critical | Impossible debug | 10 min |
| 3 | Missing CORS | 🔴 Critical | Frontend blocked | 5 min |
| 5 | No photo URL generation | 🔴 Critical | Feature broken | 10 min |
| 6 | Upload race condition | 🟡 High | Data inconsistency | 30 min |
| 4 | No event ID validation | 🟡 High | Bad UX | 10 min |
| 7 | DB connection pool too small | 🟡 High | Prod bottleneck | 5 min |
| 8 | No `top_k` bounds | 🟡 High | DoS / Mem leak | 5 min |
| 9 | No logging | 🟠 Medium | Blind ops | 30 min |
| 10 | Event isolation untested | 🟠 Medium | Risk of data leak | 2 hrs |
| 13 | Frontend error handling | 🟠 Medium | Poor UX | 15 min |
| 11 | No rate limiting | 🟠 Medium | Service abuse | 30 min |
| 12 | No stale photo cleanup | 🟠 Medium | Incomplete data | 30 min |

---

## Recommended Priority Order

**This Week:**
1. Fix CORS (blocks all frontend usage)
2. Add photo URL generation (feature is broken)
3. Validate file sizes (DoS risk)
4. Add logging (operational visibility)

**Next Week:**
5. Fix upload race condition
6. Add event ID validation
7. Add top_k bounds
8. Increase DB pool size

**After MVP:**
9. Add rate limiting
10. Add stale cleanup task
11. Add test coverage
12. Improve frontend errors
13. Consider R2 migration plan

---

## Cloudflare R2 Actionable Steps

If you decide to switch:

1. **Create R2 Account** (free tier available)
   ```bash
   # https://dash.cloudflare.com/
   # Create API token with R2 permissions
   ```

2. **Create Bucket**
   ```bash
   # Name: quickface-photos
   # Region: default
   ```

3. **Update `.env`**
   ```bash
   STORAGE_ENDPOINT=https://youraccount.r2.cloudflarestorage.com
   STORAGE_ACCESS_KEY=your_token_here
   STORAGE_SECRET_KEY=your_secret_here
   STORAGE_BUCKET=quickface-photos
   STORAGE_SECURE=1  # Use HTTPS
   ```

4. **No code changes needed!** (Already S3-compatible)

5. **Test in staging first** (verify egress savings)

6. **Migrate data**
   ```bash
   # Use S3 migration tools or boto3 scripts
   # Keep MinIO as backup for first 30 days
   ```

---

## Final Recommendation

| Decision | Rationale |
|----------|-----------|
| **Use R2 in Prod** | Saves thousands/month on egress alone |
| **Keep MinIO in Dev** | Test locally without cloud costs |
| **Fix Critical Issues First** | CORS, URLs, validation blocking everything |
| **Plan Migration** | Document steps, test thoroughly |
