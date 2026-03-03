# QuickFace (FaceSnap-inspired)

QuickFace is an open-source, self-hostable, AI-powered photo delivery platform for photographers and event studios. It automatically ingests event photos, detects faces, stores facial embeddings in a vector database, and lets guests retrieve all their photos using a single selfie.

## Features

- **Face-based search**: guests upload a selfie and instantly see all matching photos from an event.
- **Event isolation**: each event is scoped by a UUID; searches never cross events.
- **S3-compatible storage**: uses MinIO locally, easily swappable for AWS/GCP/Azure S3-compatible storage.
- **Vector search with pgvector**: embeddings stored and searched via Postgres + pgvector.
- **Async processing pipeline**: Celery workers process photos in the background.
- **Modern frontend**: Next.js frontend for guest search and a simple studio dashboard.
- **Self-host ready**: single `docker-compose up` to run the full stack.

## Architecture

- **Frontend**: Next.js app in `frontend/`
  - `/` – landing page with links for guests and studios.
  - `/events/[eventId]/search` – guest selfie search UI.
  - `/dashboard/events` – minimal event creation dashboard.
- **Backend**: FastAPI app in `backend/`
  - `POST /api/v1/events` – create events.
  - `POST /api/v1/upload/{event_id}` – upload event photos to MinIO and enqueue processing.
  - `POST /api/v1/search/{event_id}` – selfie search using pgvector cosine similarity.
  - `GET /health` – health check.
- **Workers**: Celery worker (`app.tasks.process_photo`) using Redis broker.
- **Storage**: MinIO (S3-compatible) for photo objects.
- **Database**: Postgres + pgvector with `events`, `photos`, and `face_embeddings` tables.

## Quick start

1. **Clone and configure**

```bash
git clone <your-repo-url> quickface
cd quickface
cp .env.example .env
```

2. **Start the stack**

```bash
cd deploy
docker-compose up --build
```

Services:

- API: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- MinIO console: `http://localhost:9001` (user/pass: `minioadmin` / `minioadmin`)

3. **Create an event**

Send a request to the API (e.g. via `curl`, Postman, or the dashboard):

```bash
curl -X POST http://localhost:8000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{"name": "Sample Wedding"}'
```

The response contains an `id` you will use as `event_id`.

4. **Upload photos**

```bash
curl -X POST "http://localhost:8000/api/v1/upload/<event_id>" \
  -F "files=@/path/to/photo1.jpg" \
  -F "files=@/path/to/photo2.jpg"
```

Celery workers will process these photos, detect faces, and write embeddings into `face_embeddings`.

5. **Guest selfie search**

- Open the frontend: `http://localhost:3000/events/<event_id>/search`
- Upload a selfie; QuickFace will run vector search in that event and show matching photos.

## Development

- **Backend dev server**

```bash
cd backend
uvicorn backend.app.main:app --reload
```

- **Frontend dev server**

```bash
cd frontend
npm install
npm run dev
```

Point `NEXT_PUBLIC_API_BASE` in `.env` to your running backend URL.

## License

QuickFace is released under the MIT License. See `LICENSE` for details.

