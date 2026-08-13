# MDesign Backend

Node.js + Express + MongoDB + Redis + Socket.io backend for the MDesign AI design-generation pipeline:

`prompt → planning → image generation → design generation (live cursor animation) → customization → export`

## Stack

- **API**: Express (REST) + Socket.io (realtime events)
- **DB**: MongoDB (Mongoose) — users, projects, generated images, design versions, export jobs
- **Queue**: Redis (ioredis) — image-gen, design-gen, export jobs with a worker pool
- **Email**: Brevo REST API (via Axios, API key auth)
- **Uploads**: Multer (memory) → Cloudinary
- **AI**: Pluggable model router — OpenAI-compatible & Gemini chat, OpenAI-compatible & Stability-style image APIs

## Getting started

```bash
cd backend
npm install
docker compose up -d        # mongo + redis
cp .env.example .env        # fill in API keys
npm run dev                 # API on :5000
npm run worker              # separate worker pool (optional, scalable)
```

Set `RUN_WORKERS_IN_PROCESS=true` to run workers inside the API process for local dev.

## Project pipeline (`POST /api/projects`)

1. `planning` — LLM converts prompt → structured plan (sections, components, animations, full-section mockup specs) with JSON repair retries + template fallback
2. `images_generating` — one Redis job per **full-section mockup** (complete UI screenshot per section, style-DNS injected, sequential-by-default / bounded-parallel mode, ordered reveal to frontend)
3. `designing` — three layers: **L0** vision-model reads each mockup → component sub-tree (spec fallback), **L1** assembly merges trees → `design_json` (layout engine + token style-unification + animation metadata), **L2** build-event sequencer streams the cursor animation
4. `ready` — design saved as a `DesignVersion`, user can customize or **replay** the build animation (`POST /api/projects/:id/replay`, no AI calls)
5. Customization → `POST /api/projects/:id/customize` with JSON-Patch style ops → new version
6. Export → `POST /api/projects/:id/export` with target `html | react | figma`

## Socket.io events

Client joins a room with `join_project` (auth token in handshake). Server emits to `project:<id>`:

- `pipeline_status` — orchestration phase changes
- `plan_ready` — structured plan
- `image_status` — `{ index, total, status, url?, sectionId }` per section mockup; events are **revealed in section order** (ordered buffer) even though workers run in parallel
- Build animation (Layer 2 sequencer, pace via `BUILD_PACE=fast|normal|cinematic`):
  - `section_start { section_id }`
  - `cursor_move { component_id, x_pct, y_pct }` — frontend interpolates the cursor path
  - `component_build_start { component_id, type }`
  - `component_build_done { component_id, props, style }`
  - `section_done { section_id }`
  - `design_complete { design_version_id }`
- `design_ready` — final design tree payload + `failedSections`
- `job_failed` — pipeline failure with message

## Routes

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account (Brevo welcome email) |
| POST | `/api/auth/login` / `/logout` / `/refresh` | JWT + rotating refresh token (httpOnly cookie) |
| GET | `/api/auth/me` | Current user |
| POST | `/api/projects` | Start pipeline (`prompt`, `platform`, `models?`) |
| GET | `/api/projects` / `/api/projects/:id` | List / detail with plan & latest version |
| GET | `/api/projects/:id/versions` | Design version history |
| POST | `/api/projects/:id/regenerate-image` | Regenerate single section mockup `{ index, prompt? }` |
| POST | `/api/projects/:id/replay` | Re-stream the design build animation from stored version |
| POST | `/api/projects/:id/customize` | Patch design tree → new version |
| POST | `/api/projects/:id/export` | `{ target: 'html' \| 'react' \| 'figma' }` |
| GET | `/api/exports/:id` | Export job result (code / figma url) |
| POST | `/api/uploads` | Upload image (Multer → Cloudinary) |