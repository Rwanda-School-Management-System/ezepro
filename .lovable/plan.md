# Full registration details, admin login, animated auth background

## 1. Richer signup form

Registration will collect, in one step:

- Full name (all names)
- Phone number
- Email + password
- Age
- Gender (Female / Male / Other / Prefer not to say)
- Location: Province -> District -> Sector -> Cell -> Village, each a dropdown
  that only shows options belonging to the choice above it

All fields are required and validated before the account is created. The values
are saved to the user's profile at signup, and shown/editable later on the
dashboard. Sign-in afterwards works with the same email + password.

## 2. Rwanda location data

The full official administrative list (5 provinces, 30 districts, ~416 sectors,
~2,148 cells, ~14,800 villages) will be loaded into a dedicated table in the
backend and read by the form, so each dropdown loads only the children of the
selected parent. Data is sourced from the public open dataset of Rwandan
administrative units. If a level of the public dataset turns out to be
incomplete, I'll tell you exactly which part and we can top it up later; the
form still works with a typed fallback in that case.

## 3. Admin login

- A small, low-contrast "Admin Login" link pinned to the bottom-right of the
  site, sitting below the footer content so it never overlaps the UI.
- New separate page `/admin-login` with its own compact form.
- Admin account `ezeprodeveloper@gmail.com` will be created (or updated) with
  password `Eze@2005` and granted the admin role.
- On success: admins go to `/admin`; a non-admin who signs in there is signed
  out again with a "not an administrator" message.

## 4. Animated colour background on login

Both `/auth` and `/admin-login` get a slow, smoothly shifting multi-colour
gradient backdrop built from the site's brand tokens (green / gold / navy),
with the card floating above it. Respects reduced-motion preferences.

## Technical notes

- Migration: add `age`, `gender`, `province`, `district`, `sector`, `cell`,
  `village` to `profiles`; create `rwanda_locations` (level, name, parent_id)
  with public read grant + RLS, plus indexes on `(level, parent_id)`.
- `handle_new_user` trigger updated to copy the new fields from signup metadata.
- Location seeding done via data-insert batches, not on page load.
- Admin user created via the Auth admin API with email confirmed, then a row in
  `user_roles`; `/admin-login` verifies the `admin` role with `has_role` before
  redirecting.
- New reusable `RwandaLocationPicker` component; gradient animation added as a
  keyframed utility in `src/styles.css` (no hardcoded colours in components).
- Each new route gets its own SEO `head()` (`/admin-login` marked `noindex`).
