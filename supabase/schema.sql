-- Run this once in Supabase SQL Editor after the project is provisioned.
create table if not exists public.portfolio_content (
  id text primary key check (id = 'main'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

revoke all on public.portfolio_content from anon, authenticated;
grant select on public.portfolio_content to anon, authenticated;
grant update (content, updated_at) on public.portfolio_content to authenticated;

drop policy if exists "Public can read portfolio content" on public.portfolio_content;
create policy "Public can read portfolio content"
  on public.portfolio_content for select
  to anon, authenticated
  using (id = 'main');

drop policy if exists "Portfolio owner can edit content" on public.portfolio_content;
create policy "Portfolio owner can edit content"
  on public.portfolio_content for update
  to authenticated
  using (id = 'main' and lower((select auth.jwt() ->> 'email')) = 'billybilsky5@gmail.com')
  with check (id = 'main' and lower((select auth.jwt() ->> 'email')) = 'billybilsky5@gmail.com');

insert into public.portfolio_content (id, content)
values ('main', '{
  "home": {
    "eyebrow": "Web developer",
    "title": "Building for the",
    "accent": "web",
    "closing": "front to back.",
    "subtitle": "I\u0027m Adams Bilal. I build interfaces with HTML, CSS, JavaScript and React, and the systems behind them with Python and Node.js.",
    "skills": [
      {"name": "HTML", "level": 95}, {"name": "CSS", "level": 85},
      {"name": "JavaScript", "level": 85}, {"name": "React", "level": 70},
      {"name": "Python", "level": 65}, {"name": "Node.js", "level": 65}
    ]
  },
  "about": {
    "whatIDo": "I build for the web — interfaces with HTML, CSS, JavaScript and React, and the systems underneath with Python and Node.js. I like projects that need both sides done well.",
    "howIWork": "Clean, functional, and built with intent — I\u0027d rather ship something solid than something flashy that doesn\u0027t hold up.",
    "faq": [
      {"question": "Are you available for freelance work?", "answer": "Yes — reach out through the Contact page and I\u0027ll get back to you."},
      {"question": "What kind of projects do you take on?", "answer": "Websites and web apps — from marketing sites to small tools that need both a frontend and backend."},
      {"question": "Do you work solo or with a team?", "answer": "Solo for now — happy to loop in collaborators depending on project scope."}
    ]
  },
  "projects": [
    {"title": "Sabr Scents", "stack": "HTML · CSS · JavaScript", "challenge": "A new fragrance brand needed a credible, premium-feeling web presence from scratch.", "approach": "Built a multi-page site with a shop, brand story, and a working contact form — all static, fast-loading HTML/CSS/JS.", "outcome": "Live, hosted site with a functioning enquiry form delivering messages straight to the client\u0027s inbox.", "url": "https://sabrscents.netlify.app"}
  ],
  "contact": {
    "headline": "Let\u0027s work together",
    "intro": "Open to freelance work, collabs, or just a conversation.",
    "email": "billybilsky5@gmail.com",
    "whatsapp": "https://wa.me/2347048118685",
    "tiktok": "https://www.tiktok.com/@billybilsky_1",
    "instagram": "https://www.instagram.com/bilaladams724",
    "whatsappLabel": "Chat with me directly",
    "tiktokLabel": "@billybilsky_1",
    "instagramLabel": "@bilaladams724"
  }
}'::jsonb)
on conflict (id) do nothing;
