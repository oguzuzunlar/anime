begin;

create schema if not exists f101_private;
revoke all on schema f101_private from public, anon, authenticated;

create table if not exists f101_private.teachers (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists f101_private.students (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  teacher_id uuid not null references f101_private.teachers(user_id) on delete cascade,
  code uuid not null unique default pg_catalog.gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 60),
  class_label text not null default '' check (char_length(class_label) <= 30),
  created_at timestamptz not null default now()
);
create index if not exists f101_students_by_teacher on f101_private.students(teacher_id);

create table if not exists f101_private.attempts (
  student_id uuid not null references f101_private.students(id) on delete cascade,
  event_id uuid not null,
  lesson smallint not null check (lesson between 1 and 7),
  question smallint not null check (question between 0 and 23),
  choice smallint not null check (choice between 0 and 3),
  answered_at timestamptz not null,
  received_at timestamptz not null default now(),
  primary key (student_id, event_id)
);
create index if not exists f101_attempts_by_question
  on f101_private.attempts(student_id, lesson, question, answered_at desc, received_at desc);

alter table f101_private.teachers enable row level security;
alter table f101_private.students enable row level security;
alter table f101_private.attempts enable row level security;
revoke all on f101_private.teachers, f101_private.students, f101_private.attempts from public, anon, authenticated;

create or replace function f101_private.teacher_id()
returns uuid language plpgsql stable security invoker set search_path = '' as $$
declare
  account uuid := auth.uid();
begin
  if account is null or not exists (select 1 from f101_private.teachers where user_id = account) then
    raise exception 'Teacher access required' using errcode = '42501';
  end if;
  return account;
end;
$$;
revoke all on function f101_private.teacher_id() from public, anon, authenticated;

create or replace function public.f101_student_state(p_code uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  student f101_private.students%rowtype;
begin
  select * into student from f101_private.students where code = p_code;
  if not found then return null; end if;
  return jsonb_build_object('id', student.id, 'label', student.label, 'answers', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'lesson', q.lesson, 'question', q.question, 'choice', q.choice, 'answered_at', q.answered_at
    )), '[]'::jsonb)
    from (
      select distinct on (lesson, question) lesson, question, choice, answered_at
      from f101_private.attempts
      where student_id = student.id
      order by lesson, question, answered_at desc, received_at desc, event_id desc
    ) q
  ));
end;
$$;

create or replace function public.f101_student_submit(p_code uuid, p_events jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  student f101_private.students%rowtype;
  received timestamptz := clock_timestamp();
  inserted integer;
begin
  select * into student from f101_private.students where code = p_code for share;
  if not found then raise exception 'Invalid student link' using errcode = '42501'; end if;
  if p_events is null or jsonb_typeof(p_events) <> 'array' then
    raise exception 'Invalid event batch' using errcode = '22023';
  end if;
  if jsonb_array_length(p_events) not between 1 and 24 then
    raise exception 'Invalid event batch size' using errcode = '22023';
  end if;
  insert into f101_private.attempts (student_id, event_id, lesson, question, choice, answered_at, received_at)
    select student.id, e.id, e.lesson, e.question, e.choice,
      greatest(student.created_at, least(coalesce(e.answered_at, received), received)), received
    from jsonb_to_recordset(p_events) as e(id uuid, lesson smallint, question smallint, choice smallint, answered_at timestamptz)
    on conflict (student_id, event_id) do nothing;
  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

create or replace function public.f101_teacher_students()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  owner_id uuid := f101_private.teacher_id();
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', s.id, 'label', s.label, 'class_label', s.class_label,
      'answered', coalesce(summary.answered, 0), 'correct', coalesce(summary.correct, 0),
      'attempts', coalesce(summary.attempts, 0), 'last_seen', summary.last_seen
    ) order by s.class_label, s.label, s.id)
    from f101_private.students s
    left join lateral (
      select count(*) as answered, count(*) filter (where q.choice = 0) as correct,
        sum(q.times) as attempts, max(q.last_received) as last_seen
      from (
        select distinct on (lesson, question) choice,
          count(*) over (partition by lesson, question) as times,
          max(received_at) over (partition by lesson, question) as last_received
        from f101_private.attempts
        where student_id = s.id
        order by lesson, question, answered_at desc, received_at desc, event_id desc
      ) q
    ) summary on true
    where s.teacher_id = owner_id
  ), '[]'::jsonb);
end;
$$;

create or replace function public.f101_teacher_create(p_label text, p_class text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := f101_private.teacher_id();
  student f101_private.students%rowtype;
begin
  insert into f101_private.students (teacher_id, label, class_label)
    values (owner_id, btrim(coalesce(p_label, '')), btrim(coalesce(p_class, '')))
    returning * into student;
  return jsonb_build_object('id', student.id, 'label', student.label, 'code', student.code);
end;
$$;

create or replace function public.f101_teacher_detail(p_student uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  owner_id uuid := f101_private.teacher_id();
  student f101_private.students%rowtype;
begin
  select * into student from f101_private.students where id = p_student and teacher_id = owner_id;
  if not found then return null; end if;
  return jsonb_build_object(
    'id', student.id, 'label', student.label, 'class_label', student.class_label, 'code', student.code,
    'questions', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'lesson', q.lesson, 'question', q.question, 'choice', q.choice, 'times', q.times,
        'wrong', q.wrong, 'last_seen', q.last_received
      ) order by q.lesson, q.question), '[]'::jsonb)
      from (
        select distinct on (lesson, question) lesson, question, choice,
          count(*) over (partition by lesson, question) as times,
          count(*) filter (where choice <> 0) over (partition by lesson, question) as wrong,
          max(received_at) over (partition by lesson, question) as last_received
        from f101_private.attempts
        where student_id = student.id
        order by lesson, question, answered_at desc, received_at desc, event_id desc
      ) q
    )
  );
end;
$$;

create or replace function public.f101_teacher_renew(p_student uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := f101_private.teacher_id();
  new_code uuid;
begin
  update f101_private.students set code = pg_catalog.gen_random_uuid()
    where id = p_student and teacher_id = owner_id
    returning code into new_code;
  return new_code;
end;
$$;

revoke all on function public.f101_student_state(uuid), public.f101_student_submit(uuid,jsonb)
  from public, anon, authenticated;
grant execute on function public.f101_student_state(uuid), public.f101_student_submit(uuid,jsonb)
  to anon, authenticated;

revoke all on function public.f101_teacher_students(), public.f101_teacher_create(text,text),
  public.f101_teacher_detail(uuid), public.f101_teacher_renew(uuid)
  from public, anon, authenticated;
grant execute on function public.f101_teacher_students(), public.f101_teacher_create(text,text),
  public.f101_teacher_detail(uuid), public.f101_teacher_renew(uuid)
  to authenticated;

commit;
