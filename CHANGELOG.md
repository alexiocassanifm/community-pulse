# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] - 2026-03-09

### Added

- Multi-meetup management — CRUD dashboard, meetups table with RLS, speaker assignment, preferred meetup in speaker form, upcoming meetups on homepage
- Community link settings — admin-configurable Telegram/WhatsApp link via `site_settings` table, displayed in Hero, CTA, and new GetInvolved section
- "Coming Soon" badge for scheduled meetups without a registration link (month/year only date)
- Dashboard settings page for community link configuration
- Database migrations: `004_create_meetups.sql`, `005_create_site_settings.sql`

### Changed

- Homepage restructured from 8 to 6 sections: removed PrivacyFirst, HowItWorks, WhyShare; added GetInvolved
- FAQ section trimmed
- Navigation links updated to match new homepage structure
- Migrated to ESLint 9 flat config

## [0.1.0] - 2026-03-03

### Added

- Anonymous multi-step preference form with localStorage draft persistence
- Speaker submission and management portal with token-based access
- Admin analytics dashboard with charts, metrics, and filters
- Email notifications via Resend (confirmation, status changes, messages)
- Row Level Security policies for all database tables
- Supabase Auth integration for organizer login
- IP hash-based duplicate detection with automatic cleanup
- Branding customization via environment variables
- Playwright E2E test suite
- Docker support with standalone Next.js build
- GitHub Actions CI pipeline (lint, build, e2e)
