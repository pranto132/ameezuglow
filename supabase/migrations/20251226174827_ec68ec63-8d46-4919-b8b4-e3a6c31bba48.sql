-- Bootstrap function to create the very first admin safely
create or replace function public.bootstrap_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Only allow bootstrapping if there is currently NO admin in the system
  if exists (
    select 1 from public.user_roles where role = 'admin'::public.app_role
  ) then
    return;
  end if;

  -- Avoid duplicates
  if not exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'::public.app_role
  ) then
    insert into public.user_roles (user_id, role)
    values (auth.uid(), 'admin'::public.app_role);
  end if;
end;
$$;

grant execute on function public.bootstrap_admin() to authenticated;

-- Add serial number for orders + auto-generate numeric order_number
create sequence if not exists public.orders_serial_seq;

alter table public.orders
  add column if not exists serial_number bigint;

alter table public.orders
  alter column serial_number set default nextval('public.orders_serial_seq');

update public.orders
set serial_number = nextval('public.orders_serial_seq')
where serial_number is null;

create unique index if not exists orders_serial_number_key
on public.orders(serial_number);

create or replace function public.set_orders_numbers()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.serial_number is null then
    new.serial_number := nextval('public.orders_serial_seq');
  end if;

  -- Numeric, serial-like order number (e.g. 000123)
  if new.order_number is null or length(trim(new.order_number)) = 0 then
    new.order_number := lpad(new.serial_number::text, 6, '0');
  end if;

  return new;
end;
$$;

drop trigger if exists trg_set_orders_numbers on public.orders;
create trigger trg_set_orders_numbers
before insert on public.orders
for each row
execute function public.set_orders_numbers();
