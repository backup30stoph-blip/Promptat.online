# API & Edge Functions Guidance
## GemiPrompts.store — API Routers & Postgres RPCs

> Part of the 30-backend module. Configures API architectures, Edge functions, and custom SQL RPC triggers.

---

## 1. Express API Routers (Server-Side Proxy)

When deploying full-stack architectures, all third-party credentials (Stripe, OpenAI/Gemini keys) are hidden on the Express server under `/api/*` endpoints. Avoid sending raw secret keys to the browser client.

---

## 2. Postgres RPC Functions (Database Procedures)

For tasks that involve searching across multiple tables with weighted text rankings, use database Stored Procedures (RPCs).

### Example: Polymorphic Search Function
```sql
create or replace function search_all(query_text text)
returns table(id uuid, title text, slug text, content_type text, rank float4) as $$
begin
  return query
  select p.id, p.title, p.slug, 'prompt'::text as content_type,
         ts_rank(to_tsvector('english', p.title), to_tsquery('english', query_text)) as rank
  from prompts p
  where to_tsvector('english', p.title) @@ to_tsquery('english', query_text)
  union all
  select s.id, s.title, s.slug, 'skill'::text as content_type,
         ts_rank(to_tsvector('english', s.title), to_tsquery('english', query_text)) as rank
  from skills s
  where to_tsvector('english', s.title) @@ to_tsquery('english', query_text)
  order by rank desc;
end;
$$ language plpgsql;
```

---

## 3. Edge Functions Rate Limiting

- **Newsletter capture:** The newsletter submission is rate-limited (max 1 submission per IP per minute) to prevent bot spam using a lightweight Edge Function proxy.
- **Download counter increments:** A background function registers when user downloads file, increments downloads column in content tables, and logs details to database downloads table.
