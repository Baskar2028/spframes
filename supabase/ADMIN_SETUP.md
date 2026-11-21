# Granting a client admin access

1. Create the client account under Supabase Dashboard → Authentication → Users.
2. Copy the account UUID.
3. Run `insert into public.admin_users(user_id) values ('UUID');` in SQL Editor.
4. Share `/admin/login` and the account's sign-in credentials securely.
5. Remove access with `delete from public.admin_users where user_id = 'UUID';`.

The admin dashboard is protected by Supabase Auth and an explicit `admin_users` allowlist. Do not use a hardcoded password or expose the service-role key.

## Booking tracking

Website booking requests continue to be saved in `public.enquiries` and open WhatsApp for the customer. To enable the dashboard's **Bookings** and **Completed** menus, run the updated `supabase/schema.sql` in the Supabase SQL Editor. It adds a pending/completed status and grants allowlisted admins permission to update only that status. Existing enquiries are marked pending.
