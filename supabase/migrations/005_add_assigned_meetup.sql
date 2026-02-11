-- Add assigned meetup field to speaker submissions
ALTER TABLE public.speaker_submissions
  ADD COLUMN assigned_meetup TEXT;
