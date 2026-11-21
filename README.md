# Atexra Photography — React + Supabase

A Vite, React (JavaScript), React Router and Supabase rebuild based on the supplied `index.html`.

## Requirements
- Node.js 18+ and npm
- A Supabase project for live pricing, enquiries and admin authentication

## Run locally
1. Extract the ZIP and open this directory in VS Code.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`.
4. Add your Supabase Project URL and anon/publishable key to `.env`.
5. Run the SQL in `supabase/schema.sql` in Supabase Dashboard → SQL Editor.
6. Start the site: `npm run dev`
7. Production build: `npm run build`; preview with `npm run preview`.

Without Supabase credentials, the public site and galleries still render. Enquiry submission and admin sign-in are intentionally unavailable until Supabase is configured. No fake authentication or browser-only booking storage is used.

## Supabase setup and granting admin access
1. Create a Supabase project and copy Project URL + anon/publishable key from Project Settings → API.
2. Run `supabase/schema.sql` in SQL Editor. It creates `services`, `enquiries`, and `admin_users`, enables RLS, seeds six service rows, and installs policies.
3. In Authentication → Users, create/invite the client's email account. Confirm the account as appropriate.
4. Copy that user's UUID and run:
   `insert into public.admin_users(user_id) values ('AUTH-USER-UUID-HERE');`
5. The client signs in at `/admin/login`; dashboard is `/admin/dashboard`.
6. To revoke admin access, delete that UUID from `public.admin_users`. Do not grant admin access to every authenticated user.

## Admin implementation map
- Login: `src/admin/AdminLogin.jsx`
- Route guard: `src/admin/ProtectedRoute.jsx`
- Dashboard / price updates: `src/admin/AdminDashboard.jsx`
- Supabase client: `src/lib/supabase.js`
- Pricing database: `public.services`
- Admin allowlist: `public.admin_users`
- RLS policies and seed rows: `supabase/schema.sql`

Only authorised UUIDs present in `admin_users` can update prices. Public visitors can read active service prices and submit enquiries, but cannot read enquiries. The frontend uses only the anon/publishable key. The service-role key must never be exposed in browser code.

## Edit business information
Update `src/config/siteConfig.js`:
- `whatsappNumber`: country code + phone number, digits only
- `phoneDisplay`, `email`, `address`
- social URLs
- `ownerName` and `ownerPhoto`

The supplied HTML did not provide a confirmed owner name, so the owner name remains an editable placeholder. Phone, email, WhatsApp and social details carried over from the source HTML are placeholders and must be replaced/verified before launch.

## Update photography images
- Existing Best Works source image URLs were preserved in `src/data/media.js` (`IMG` and `WORKS`).
- Service card images and galleries are also configured there and in `src/data/services.js`.
- Replace image URLs in `src/data/media.js` to update the photography.
- Hero slider slides are configured in `src/pages/Home.jsx`.

## Update prices
- Initial public fallback prices are in `src/data/services.js` for local preview only.
- Once Supabase is configured and seeded, public service pages read current price from `public.services`.
- Client signs in at `/admin/login`, edits the value in the dashboard and selects Save changes. The price is stored in Supabase and displayed on the matching public service page.

## Routes
- `/` Home
- `/about` About
- `/contact` Contact
- `/services/wedding`
- `/services/prewedding`
- `/services/postwedding`
- `/services/birthday`
- `/services/yellow-festival`
- `/services/baby-shower`
- `/admin/login` (not in public navigation)
- `/admin/dashboard` (protected)

## Important content notes
The source HTML identifies the studio in its About copy as **SP FRAMES**, while its footer is branded **ATEXRA**. The original About paragraph and portfolio image URLs are retained; update the About copy if the studio name should be Atexra throughout. Original business phone/email/social links were example-style placeholders in the source and are not verified.
