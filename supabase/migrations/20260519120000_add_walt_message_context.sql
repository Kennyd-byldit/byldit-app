alter table walt_messages add column if not exists vehicle_id uuid references vehicles(id) on delete set null;
alter table walt_messages add column if not exists screen text default 'garage';
