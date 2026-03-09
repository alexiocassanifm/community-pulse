# Meetup Management Feature Design

## Overview

Add meetup event management to the dashboard. Admins create meetups (date, location, Luma URL), assign accepted speakers to them, and control homepage visibility. Speakers can optionally indicate a preferred meetup when submitting.

## Data Model

### New `meetups` table

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| title | TEXT NOT NULL | |
| date | TIMESTAMPTZ NOT NULL | |
| location | TEXT NOT NULL | |
| luma_url | TEXT | Optional |
| homepage_visible | BOOLEAN | Default false |
| status | TEXT | draft / published / past. Default draft |
| created_at | TIMESTAMPTZ | Default now() |
| updated_at | TIMESTAMPTZ | Default now() |

RLS: anon SELECT published only; authenticated organizers full CRUD; service role full.

### Changes to `speaker_submissions`

- `preferred_meetup UUID REFERENCES meetups(id) ON DELETE SET NULL` — speaker's choice at submission
- `assigned_meetup UUID REFERENCES meetups(id) ON DELETE SET NULL` — admin assignment (accepted speakers only, app-level enforcement)

## API Routes

### New

- `POST /api/meetups` — Create meetup (organizer auth)
- `GET /api/meetups` — List meetups (public: published only; organizer: all)
- `PATCH /api/meetups/[id]` — Update meetup (organizer auth)
- `DELETE /api/meetups/[id]` — Delete meetup (organizer auth, blocked if speakers assigned)
- `PATCH /api/speakers/admin/[id]/assign-meetup` — Assign accepted speaker to meetup

### Modified

- `POST /api/speakers/submit` — Accept optional `preferred_meetup` field

## Dashboard

### Meetup list page (`/dashboard/meetups`)

- Nav item "Meetups" with Calendar icon, between Demographics and Speakers
- Table: title, date, location, status badge, homepage visibility toggle, actions
- "Create Meetup" button
- Status badges: draft (gray), published (green), past (muted)

### Create/Edit meetup dialog

- Fields: title, date, location, Luma URL, status, homepage visible toggle
- Delete blocked if speakers are assigned

### Speaker detail page changes

- Accepted speakers: "Assign to meetup" dropdown with published meetups
- Shows current assignment and speaker's preferred meetup if any

## Speaker Submission Form

- If published meetups exist: optional dropdown "Which meetup are you applying for?" with title + date options + "No preference" default
- If no published meetups: field hidden

## Homepage

- New "Upcoming Meetups" section after hero
- Only renders if published + homepage_visible + future date meetups exist
- Cards: title, formatted date, location
- "View on Luma" button if luma_url is set
- No meetups = section not rendered
