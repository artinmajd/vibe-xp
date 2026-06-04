-- vibe-xp database schema
-- Run this in the Supabase SQL editor (once, top to bottom)

-- teams
create table teams (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text unique not null,
  emoji text,
  created_at timestamptz default now()
);

-- students (id must match auth.users.id)
create table students (
  id uuid primary key,
  team_id uuid references teams(id),
  display_name text not null,
  email text unique not null,
  created_at timestamptz default now()
);

-- team_members (enforces 3-per-team rule via trigger)
create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) not null,
  student_id uuid references students(id) unique not null,
  joined_at timestamptz default now()
);

-- trigger: block a 4th member joining any team
create or replace function check_team_member_limit()
returns trigger as $$
begin
  if (select count(*) from team_members where team_id = NEW.team_id) >= 3 then
    raise exception 'This team already has 3 members.';
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger enforce_team_member_limit
  before insert on team_members
  for each row execute function check_team_member_limit();

-- achievements
create table achievements (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  session_number int not null,
  block_number int not null,
  title text not null,
  description text not null,
  xp int not null,
  proof_type text not null,
  proof_config jsonb not null default '{}',
  is_secret boolean default false,
  is_active boolean default true
);

-- submissions
create table submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) not null,
  student_id uuid references students(id) not null,
  achievement_id uuid references achievements(id) not null,
  proof_data jsonb not null default '{}',
  screenshot_url text,
  status text not null check (status in ('auto_approved', 'pending', 'approved', 'rejected')),
  xp_awarded int not null default 0,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  unique (team_id, achievement_id)
);

-- sessions
create table sessions (
  id int primary key,
  title text not null,
  is_active boolean not null default false
);

-- partial unique index: only one active session at a time
create unique index one_active_session on sessions (is_active) where is_active = true;

-- instructor_actions (audit log)
create table instructor_actions (
  id uuid primary key default gen_random_uuid(),
  instructor_email text not null,
  submission_id uuid references submissions(id),
  team_id uuid references teams(id),
  action text not null,
  xp_delta int default 0,
  note text,
  created_at timestamptz default now()
);

-- manual_xp_grants
create table manual_xp_grants (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) not null,
  xp int not null,
  reason text not null,
  granted_by text not null,
  created_at timestamptz default now()
);
