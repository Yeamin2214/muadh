-- Mu'adh: mentor applications with admin verification.
-- Run once in the Supabase SQL Editor, after 04.

-- 1. New role "applicant": signed up as a mentor, not yet verified.
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('learner', 'applicant', 'mentor', 'admin'));

-- 2. Sign-up creates a learner, or an applicant if they applied as a mentor.
--    Nobody can ever sign up directly as a mentor or admin.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, gender, language, role, reads_arabic)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(new.raw_user_meta_data->>'gender', ''),
    coalesce(nullif(new.raw_user_meta_data->>'language', ''), 'en'),
    case when new.raw_user_meta_data->>'account' = 'mentor' then 'applicant' else 'learner' end,
    case when new.raw_user_meta_data->>'account' = 'mentor' then 2 else null end
  );
  return new;
end $$;

-- 3. The application details an admin reviews.
create table if not exists mentor_applications (
  user_id      uuid primary key references profiles(id) on delete cascade,
  details      jsonb not null,
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note         text,                       -- reason, if rejected
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);
alter table mentor_applications enable row level security;
drop policy if exists "own application read" on mentor_applications;
create policy "own application read" on mentor_applications for select using (auth.uid() = user_id);

-- 4. Approve or reject by email. Only an admin can run these (from the SQL Editor now, the admin panel later).
create or replace function approve_mentor(mentor_email text) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  select id into uid from auth.users where email = lower(mentor_email);
  if uid is null then return 'No account with that email'; end if;
  update profiles set role = 'mentor' where id = uid and role = 'applicant';
  update mentor_applications set status = 'approved', reviewed_at = now(), note = null where user_id = uid;
  return 'Approved';
end $$;

create or replace function reject_mentor(mentor_email text, reason text default null) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  select id into uid from auth.users where email = lower(mentor_email);
  if uid is null then return 'No account with that email'; end if;
  update mentor_applications set status = 'rejected', reviewed_at = now(), note = reason where user_id = uid;
  return 'Rejected';
end $$;

revoke execute on function approve_mentor(text) from public, anon, authenticated;
revoke execute on function reject_mentor(text, text) from public, anon, authenticated;

-- How to use (SQL Editor):
--   select approve_mentor('mentor@example.com');
--   select reject_mentor('mentor@example.com', 'Please add your organisation details');
