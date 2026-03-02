CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS events (
    id uuid PRIMARY KEY,
    name varchar(255) NOT NULL,
    slug varchar(255) UNIQUE,
    starts_at timestamp,
    ends_at timestamp,
    status varchar(32) NOT NULL DEFAULT 'active',
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photos (
    id serial PRIMARY KEY,
    event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    storage_key varchar(512) NOT NULL UNIQUE,
    public_url varchar(1024),
    width integer,
    height integer,
    processing_status varchar(32) NOT NULL DEFAULT 'pending',
    processed_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS face_embeddings (
    id serial PRIMARY KEY,
    event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    photo_id integer NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    face_index integer NOT NULL,
    embedding vector(128) NOT NULL,
    bbox jsonb,
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_face_embeddings_event_id
    ON face_embeddings (event_id);

CREATE INDEX IF NOT EXISTS idx_face_embeddings_embedding_ann
    ON face_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

