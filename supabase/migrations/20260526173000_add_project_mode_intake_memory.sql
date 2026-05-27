alter table projects add column if not exists project_mode text
  check (project_mode in ('maintenance', 'repair', 'upgrade', 'restoration', 'diagnostic'));

alter table projects add column if not exists plan_type text default 'phase_plan'
  check (plan_type in ('checklist', 'repair_plan', 'upgrade_plan', 'phase_plan', 'diagnostic_log'));

alter table projects add column if not exists intake_summary text;

alter table projects add column if not exists intake_answers jsonb default '{}'::jsonb;
