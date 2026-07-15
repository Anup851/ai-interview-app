-- PrepPilot AI Interview Platform - Supabase schema
-- Run this in the Supabase SQL editor after creating a project.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'experience_level') then
    create type public.experience_level as enum ('entry', 'mid', 'senior', 'lead');
  end if;

  if not exists (select 1 from pg_type where typname = 'question_style') then
    create type public.question_style as enum ('balanced', 'technical', 'behavioral', 'system_design');
  end if;

  if not exists (select 1 from pg_type where typname = 'interview_status') then
    create type public.interview_status as enum ('draft', 'in_progress', 'completed', 'needs_review');
  end if;

  if not exists (select 1 from pg_type where typname = 'activity_type') then
    create type public.activity_type as enum ('resume', 'generator', 'mock', 'feedback', 'report', 'profile');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
  end if;

  if not exists (select 1 from pg_type where typname = 'usage_event_type') then
    create type public.usage_event_type as enum ('resume_analysis', 'question_generation', 'mock_interview', 'feedback_report');
  end if;

  if not exists (select 1 from pg_type where typname = 'analysis_status') then
    create type public.analysis_status as enum ('pending', 'completed', 'failed');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  target_role text default 'Software Engineer',
  avatar_url text,
  email_reminders boolean not null default true,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size integer,
  mime_type text not null default 'application/pdf',
  extracted_text text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resumes add column if not exists extracted_text text;

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  ats_score integer not null check (ats_score between 0 and 100),
  status public.analysis_status not null default 'completed',
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '[]'::jsonb,
  keyword_matches jsonb not null default '{}'::jsonb,
  raw_summary text,
  created_at timestamptz not null default now()
);

alter table public.resume_analyses add column if not exists status public.analysis_status not null default 'completed';

create table if not exists public.question_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_role text not null,
  experience public.experience_level not null default 'senior',
  style public.question_style not null default 'balanced',
  skills text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.generated_questions (
  id uuid primary key default gen_random_uuid(),
  question_set_id uuid not null references public.question_sets(id) on delete cascade,
  position integer not null,
  question text not null,
  category text default 'general',
  expected_signals text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (question_set_id, position)
);

create table if not exists public.mock_interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_set_id uuid references public.question_sets(id) on delete set null,
  role text not null,
  status public.interview_status not null default 'draft',
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer not null default 0,
  audio_path text,
  overall_score integer check (overall_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mock_interviews add column if not exists audio_path text;

create table if not exists public.interview_answers (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.mock_interviews(id) on delete cascade,
  question text not null,
  transcript text,
  answer_seconds integer not null default 0,
  position integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  interview_id uuid not null references public.mock_interviews(id) on delete cascade,
  overall_score integer not null check (overall_score between 0 and 100),
  communication_score integer not null check (communication_score between 0 and 100),
  technical_score integer not null check (technical_score between 0 and 100),
  confidence_score integer not null check (confidence_score between 0 and 100),
  feedback_cards jsonb not null default '[]'::jsonb,
  improvement_suggestions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (interview_id)
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.activity_type not null,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed_dates text[] not null default '{}',
  goal text not null default 'Finish one prep action today',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.user_dsa_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  solved text[] not null default '{}',
  attempts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan_name text not null default 'free',
  status public.subscription_status not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.usage_event_type not null,
  quantity integer not null default 1 check (quantity > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists subscriptions_user_id_unique_idx on public.subscriptions(user_id);
create index if not exists resumes_user_id_idx on public.resumes(user_id);
create index if not exists resume_analyses_user_id_idx on public.resume_analyses(user_id);
create index if not exists question_sets_user_id_idx on public.question_sets(user_id);
create index if not exists mock_interviews_user_id_idx on public.mock_interviews(user_id);
create index if not exists mock_interviews_created_at_idx on public.mock_interviews(created_at desc);
create index if not exists ai_feedback_user_id_idx on public.ai_feedback(user_id);
create index if not exists activity_events_user_id_created_at_idx on public.activity_events(user_id, created_at desc);
create index if not exists user_streaks_user_id_idx on public.user_streaks(user_id);
create index if not exists user_dsa_progress_user_id_idx on public.user_dsa_progress(user_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists usage_events_user_id_created_at_idx on public.usage_events(user_id, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
drop trigger if exists resumes_set_updated_at on public.resumes;
drop trigger if exists mock_interviews_set_updated_at on public.mock_interviews;
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
drop trigger if exists user_streaks_set_updated_at on public.user_streaks;
drop trigger if exists user_dsa_progress_set_updated_at on public.user_dsa_progress;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger resumes_set_updated_at before update on public.resumes for each row execute function public.set_updated_at();
create trigger mock_interviews_set_updated_at before update on public.mock_interviews for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger user_streaks_set_updated_at before update on public.user_streaks for each row execute function public.set_updated_at();
create trigger user_dsa_progress_set_updated_at before update on public.user_dsa_progress for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'Candidate'),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    email = coalesce(nullif(excluded.email, ''), profiles.email),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();

  insert into public.subscriptions (user_id, plan_name, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_analyses enable row level security;
alter table public.question_sets enable row level security;
alter table public.generated_questions enable row level security;
alter table public.mock_interviews enable row level security;
alter table public.interview_answers enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.activity_events enable row level security;
alter table public.user_streaks enable row level security;
alter table public.user_dsa_progress enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users manage own resumes" on public.resumes;
drop policy if exists "Users manage own resume analyses" on public.resume_analyses;
drop policy if exists "Users manage own question sets" on public.question_sets;
drop policy if exists "Users read own generated questions" on public.generated_questions;
drop policy if exists "Users insert own generated questions" on public.generated_questions;
drop policy if exists "Users update own generated questions" on public.generated_questions;
drop policy if exists "Users delete own generated questions" on public.generated_questions;
drop policy if exists "Users manage own interviews" on public.mock_interviews;
drop policy if exists "Users manage answers for own interviews" on public.interview_answers;
drop policy if exists "Users manage own feedback" on public.ai_feedback;
drop policy if exists "Users manage own activity" on public.activity_events;
drop policy if exists "Users manage own streak" on public.user_streaks;
drop policy if exists "Users manage own dsa progress" on public.user_dsa_progress;
drop policy if exists "Users read own subscriptions" on public.subscriptions;
drop policy if exists "Users read own usage" on public.usage_events;
drop policy if exists "Users insert own usage" on public.usage_events;

create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own resumes" on public.resumes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own resume analyses" on public.resume_analyses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own question sets" on public.question_sets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own generated questions" on public.generated_questions for select using (
  exists (
    select 1 from public.question_sets qs
    where qs.id = generated_questions.question_set_id
      and qs.user_id = auth.uid()
  )
);
create policy "Users insert own generated questions" on public.generated_questions for insert with check (
  exists (
    select 1 from public.question_sets qs
    where qs.id = generated_questions.question_set_id
      and qs.user_id = auth.uid()
  )
);
create policy "Users update own generated questions" on public.generated_questions for update using (
  exists (
    select 1 from public.question_sets qs
    where qs.id = generated_questions.question_set_id
      and qs.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.question_sets qs
    where qs.id = generated_questions.question_set_id
      and qs.user_id = auth.uid()
  )
);
create policy "Users delete own generated questions" on public.generated_questions for delete using (
  exists (
    select 1 from public.question_sets qs
    where qs.id = generated_questions.question_set_id
      and qs.user_id = auth.uid()
  )
);
create policy "Users manage own interviews" on public.mock_interviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage answers for own interviews" on public.interview_answers for all using (
  exists (
    select 1 from public.mock_interviews mi
    where mi.id = interview_answers.interview_id
      and mi.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.mock_interviews mi
    where mi.id = interview_answers.interview_id
      and mi.user_id = auth.uid()
  )
);
create policy "Users manage own feedback" on public.ai_feedback for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own activity" on public.activity_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own streak" on public.user_streaks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own dsa progress" on public.user_dsa_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users read own usage" on public.usage_events for select using (auth.uid() = user_id);
create policy "Users insert own usage" on public.usage_events for insert with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false), ('reports', 'reports', false), ('interview-audio', 'interview-audio', false)
on conflict (id) do nothing;

drop policy if exists "Users upload own resume files" on storage.objects;
drop policy if exists "Users read own resume files" on storage.objects;
drop policy if exists "Users update own resume files" on storage.objects;
drop policy if exists "Users delete own resume files" on storage.objects;
drop policy if exists "Users manage own report files" on storage.objects;
drop policy if exists "Users manage own interview audio files" on storage.objects;

create policy "Users upload own resume files" on storage.objects for insert with check (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Users read own resume files" on storage.objects for select using (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Users update own resume files" on storage.objects for update using (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "Users delete own resume files" on storage.objects for delete using (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users manage own report files" on storage.objects for all using (
  bucket_id = 'reports'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'reports'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users manage own interview audio files" on storage.objects for all using (
  bucket_id = 'interview-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'interview-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);
