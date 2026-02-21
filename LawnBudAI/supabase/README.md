# Supabase Configuration & Migrations

This directory contains Supabase configurations and database migrations for LawnBudAI.

## Directory Structure

```
supabase/
├── migrations/               # Database migrations (auto-applied via supabase db push)
│   └── 20260221000000_*.sql # Migration files with timestamp prefix
├── config.toml              # Supabase local development configuration
└── README.md               # This file
```

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

Or via Homebrew (macOS):
```bash
brew install supabase/tap/supabase
```

### 2. Login to Supabase

```bash
supabase login
```

This will open a browser to create a CLI access token:
1. Go to https://app.supabase.com/account/tokens
2. Create a new token with appropriate scopes
3. Copy and paste the token when prompted

### 3. Link Your Project

From the project directory:
```bash
cd LawnBudAI
supabase link --project-ref kzycwqjcqcmenlwswhnf
```

Replace `kzycwqjcqcmenlwswhnf` with your actual Supabase project reference ID.

### 4. Push Migrations Locally

To test migrations locally (requires Docker):
```bash
supabase start
```

Then push the migrations:
```bash
supabase db push
```

This will apply all migrations in `supabase/migrations/` to your local database.

### 5. Stop Local Environment

```bash
supabase stop
```

## Database Migrations

### Migration Files

Migrations are SQL files in the `supabase/migrations/` directory with names following the pattern:
```
YYYYMMDDHHMMSS_description.sql
```

Example: `20260221000000_create_lawn_events_schema.sql`

### Creating a New Migration

To create a new migration file:

```bash
supabase migration new create_new_table
```

This creates a new file: `supabase/migrations/YYYYMMDDHHMMSS_create_new_table.sql`

Then edit the file with your SQL changes.

### Pushing Migrations to Production

Migrations are automatically applied during the GitHub Actions deployment pipeline via:
```bash
supabase db push
```

**Required GitHub Actions Secrets:**
- `SUPABASE_ACCESS_TOKEN` - Your Supabase CLI access token
- `SUPABASE_DB_PASSWORD` - Your Supabase database password

### Viewing Migration Status

```bash
# Check which migrations are pending
supabase migration list --local

# Check remote (production) migration status
supabase migration list --remote
```

## Current Migrations

### 20260221000000_create_lawn_events_schema.sql

Creates the lawn care events tracking schema:

- **mow_events** - Lawn mowing records with height measurements
- **water_events** - Watering records with source tracking (sprinkler/manual/rain)
- **fertilizer_events** - Fertilizer application records with type tracking

Each table includes:
- User-specific RLS policies (users only see their own events)
- Data validation constraints
- Performance indexes
- Automatic timestamp tracking

Also creates:
- Statistical views (mowing_stats, watering_stats, fertilizer_stats)
- RPC functions for client-side use

## Development Workflow

### During Development

1. Make changes locally: Edit files in the app
2. For database changes:
   - Create a new migration file: `supabase migration new your_migration_name`
   - Edit the generated SQL file
   - Test locally: `supabase start` → `supabase db push`
   - Commit the migration file to git

3. Push your branch to GitHub
4. GitHub Actions will automatically:
   - Run quality gates
   - Apply migrations to production
   - Build and deploy the app

### Testing Migrations Locally

```bash
# Start local Supabase environment
supabase start

# Apply migrations
supabase db push

# Run tests
yarn test:playwright

# Stop when done
supabase stop
```

## Production Deployment

Migrations are applied automatically before the app build in the GitHub Actions deploy workflow:

1. Code pushed to main branch
2. GitHub Actions triggered
3. `supabase db push` executed (applies any pending migrations)
4. App built and deployed to Cloudflare Pages

## Security

**IMPORTANT**: Never commit:
- `.env` files with sensitive credentials
- Database passwords
- API keys or tokens

The GitHub Actions pipeline uses GitHub Secrets for all credentials:
- `SUPABASE_ACCESS_TOKEN` - Used to authenticate with Supabase API
- `SUPABASE_DB_PASSWORD` - Used to connect to production database

## Troubleshooting

### "Permission denied" when running supabase CLI

Make sure you're logged in:
```bash
supabase logout
supabase login
```

### "Project not linked" error

Link your project first:
```bash
supabase link --project-ref kzycwqjcqcmenlwswhnf
```

### Migrations won't push

Check that:
1. Your access token is valid: `supabase projects list`
2. Database password is correct in GitHub Secrets
3. No conflicting migrations exist (each must have unique timestamp)
4. Local migrations match remote (if starting from existing project)

### Can't connect to local database

Make sure Docker is running:
```bash
# macOS
open -a Docker

# Then start Supabase
supabase start
```

## Resources

- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/managing-environments)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Database Migrations with Supabase](https://supabase.com/docs/guides/realtime/security-rules)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## References in Code

The migrations are referenced by:
- Event hooks: `hooks/useM owEvents.ts`, `hooks/useWaterEvents.ts`
- Event types: `models/mow-event.ts`, `models/water-event.ts`
- E2E tests: `e2e/playwright/mow-events.spec.ts`, etc.
