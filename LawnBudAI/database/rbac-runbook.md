# RBAC Operational Runbook

This document provides operational instructions for managing user roles without the in-app admin UI (Phase 2.0). Phase 2.5 will add a UI-based admin panel.

## Overview

Three roles exist:
- **`user`**: Free tier (100 API calls/hour, no premium features)
- **`premium`**: Paid tier (1,000 API calls/hour, premium features enabled)
- **`admin`**: Internal admin (unlimited API calls, access to telemetry dashboards)

## Common Tasks

### Find a User's UUID

```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'user@example.com';
```

### Check Current Roles

See all users and their roles:

```sql
SELECT u.id, u.email, r.role, r.granted_at
FROM user_roles r
JOIN auth.users u ON r.user_id = u.id
ORDER BY r.role, r.granted_at;
```

### Promote User to Admin

Replace `<UUID>` with the user's UUID from `SELECT id FROM auth.users WHERE email = ...`:

```sql
UPDATE user_roles
SET role = 'admin', updated_at = now()
WHERE user_id = '<UUID>';
```

### Promote User to Premium

Manually promote a beta tester to premium (until RevenueCat integration in Phase 2.5):

```sql
UPDATE user_roles
SET role = 'premium', updated_at = now()
WHERE user_id = '<UUID>';
```

### Demote User Back to Free

```sql
UPDATE user_roles
SET role = 'user', updated_at = now()
WHERE user_id = '<UUID>';
```

### Check User's Role from App

The app can call this function to fetch the user's role safely:

```sql
SELECT get_user_role();
```

### Check Rate Limits for a User

View all rate limit usage for a specific user:

```sql
SELECT endpoint, window_start, request_count
FROM rate_limit_counters
WHERE user_id = '<UUID>'
ORDER BY window_start DESC
LIMIT 20;
```

### Reset Rate Limit for a User

If a user hits rate limit due to a bug and needs a reset:

```sql
DELETE FROM rate_limit_counters
WHERE user_id = '<UUID>'
  AND window_start > now() - interval '1 hour';
```

## Troubleshooting

### User Role Not Showing After Sign-Up

The trigger should auto-assign a 'user' role on sign-up. If it didn't:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<UUID>', 'user')
ON CONFLICT DO NOTHING;
```

### Modifying Another Admin's Role

All role changes are tracked with `granted_by` (optional). If you're promoting/demoting another admin, the system records who made the change:

```sql
UPDATE user_roles
SET role = 'user', granted_by = auth.uid(), updated_at = now()
WHERE user_id = '<THEIR_UUID>';
```

### Users Keep Hitting Rate Limits

Check if they're legitimately hitting limits:

```sql
SELECT endpoint, COUNT(*) as requests_per_endpoint
FROM rate_limit_counters
WHERE user_id = '<UUID>'
  AND window_start = date_trunc('hour', now())
GROUP BY endpoint;
```

If they're free users and need higher limits, promote to premium. If it's a bug causing excess requests, investigate the app logs.

## Phase 2.5: Admin Panel

Once Phase 2.5 is complete, the in-app admin UI will provide a GUI for these operations. Until then, use the SQL commands above in the Supabase SQL Editor.

## Important Security Notes

- Only `service_role` can modify roles (client-side calls will fail)
- Users can read their own role but not others'
- Rate limits are reset hourly by design
- All role changes are logged with `updated_at` timestamps
