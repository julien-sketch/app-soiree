-- À exécuter dans le SQL Editor du projet Supabase existant.
-- Ne crée pas de table et ne supprime aucune participation.
begin;
alter table public.quiz_results enable row level security;
grant usage on schema public to anon;
grant select, insert on table public.quiz_results to anon;

drop policy if exists "boss_quiz_insert" on public.quiz_results;
create policy "boss_quiz_insert" on public.quiz_results
  for insert to anon
  with check (
    profile in ('commandant', 'explorateur', 'jet-setter', 'digital-nomad', 'bon-vivant', 'stratege')
    and destination is not null
    and length(trim(destination)) between 1 and 100
  );

drop policy if exists "boss_quiz_read" on public.quiz_results;
create policy "boss_quiz_read" on public.quiz_results
  for select to anon using (true);
commit;

-- Vérifier les autres policies, notamment RESTRICTIVE, si le refus persiste.
select policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' and tablename = 'quiz_results';
