# Private portfolio editor

The portfolio uses Supabase Auth for a passwordless owner sign-in and a single JSON content row in Postgres. Public pages can read the content; only the owner email in the database policy can update it. Public sign-ups are disabled.

## Supabase project

- Project: `adams-bilal-portfolio` in the `Adams Bilal Portfolio` organization (Free plan).
- Authentication provider: Email.
- New-user sign-ups: disabled. The owner was invited from Authentication → Users.
- Site URL: `https://adamsbilal.netlify.app`.
- Allowed sign-in redirect: `https://adamsbilal.netlify.app/admin/`.
- Database policy owner: `billybilsky5@gmail.com`.

The `supabase-config.js` file contains the project URL and the **publishable** API key. These values identify the project and are meant for browser apps. Never add a Supabase secret/service-role key or database password to the site.

## Database

The SQL in `supabase/schema.sql` creates and seeds `public.portfolio_content`, enables row-level security, grants public read access for the published portfolio, and restricts updates to the owner email. It has already been applied to the project. Re-running the file is safe: it leaves an existing content row unchanged.

## Sign in and edit

1. Accept the Supabase invitation sent to the owner email.
2. Open `/admin/` on the deployed site and request a sign-in link.
3. Edit the JSON for Home, About, Projects, and Contact, then choose **Save changes**. The public pages read the saved content from Supabase.

The editor validates JSON before saving. Projects and FAQ items are arrays, so add or remove entries in those arrays to manage the lists.
