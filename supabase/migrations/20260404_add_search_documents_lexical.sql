create extension if not exists pg_trgm;

create index if not exists documents_lexical_search_idx
on documents
using gin (
  (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'B')
  )
);

create or replace function public.search_documents_lexical(
  query_text text,
  match_count integer default 8
)
returns table (
  slug text,
  title text,
  topic text,
  content text,
  lexical_score real
)
language sql
stable
security definer
set search_path = public
as $$
  with normalized_query as (
    select
      nullif(trim(query_text), '') as raw_query,
      case
        when nullif(trim(query_text), '') is null then null::tsquery
        else websearch_to_tsquery('simple', trim(query_text))
      end as ts_query
  ),
  ranked as (
    select
      d.slug,
      d.title,
      d.topic,
      d.content,
      (
        coalesce(
          ts_rank_cd(
            setweight(to_tsvector('simple', coalesce(d.title, '')), 'A') ||
            setweight(to_tsvector('simple', coalesce(d.content, '')), 'B'),
            nq.ts_query
          ),
          0
        )
        + case
            when nq.raw_query is not null and lower(d.title) = lower(nq.raw_query) then 5.0
            else 0
          end
        + case
            when nq.raw_query is not null and lower(d.title) like '%' || lower(nq.raw_query) || '%' then 2.0
            else 0
          end
        + case
            when nq.raw_query is not null and lower(d.content) like '%' || lower(nq.raw_query) || '%' then 0.75
            else 0
          end
      )::real as lexical_score
    from documents d
    cross join normalized_query nq
    where nq.raw_query is not null
      and (
        (
          nq.ts_query is not null
          and (
            setweight(to_tsvector('simple', coalesce(d.title, '')), 'A') ||
            setweight(to_tsvector('simple', coalesce(d.content, '')), 'B')
          ) @@ nq.ts_query
        )
        or lower(d.title) like '%' || lower(nq.raw_query) || '%'
        or lower(d.content) like '%' || lower(nq.raw_query) || '%'
      )
  )
  select
    ranked.slug,
    ranked.title,
    ranked.topic,
    ranked.content,
    ranked.lexical_score
  from ranked
  order by ranked.lexical_score desc, ranked.slug asc
  limit greatest(coalesce(match_count, 8), 1);
$$;

grant execute on function public.search_documents_lexical(text, integer) to anon;
grant execute on function public.search_documents_lexical(text, integer) to authenticated;
grant execute on function public.search_documents_lexical(text, integer) to service_role;
