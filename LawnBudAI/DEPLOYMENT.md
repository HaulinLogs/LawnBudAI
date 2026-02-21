# Deployment Pipeline Setup

This document explains how to set up the automated deployment pipeline with database migrations.

## Architecture

```
Local Development
       ↓
  Git Commit
       ↓
GitHub Push (main branch)
       ↓
GitHub Actions Triggered
       ↓
[1] Run Quality Gates (lint, test, coverage, security)
       ↓ (success)
[2] Setup Supabase CLI
       ↓
[3] Apply Database Migrations (supabase db push)
       ↓ (success)
[4] Build Expo Web Export
       ↓ (success)
[5] Deploy to Cloudflare Pages
       ↓
✅ Live at https://haulinlogs.github.io/LawnBudAI/
```

## Required GitHub Secrets

Add these secrets to your GitHub repository settings:
`Settings > Secrets and variables > Actions > New repository secret`

### Existing Secrets (Already Configured)

- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token
- `CLOUDFLARE_PROJECT_NAME` - Cloudflare Pages project name

**Note**: The project reference ID (`kzycwqjcqcmenlwswhnf`) is hardcoded in the workflow and doesn't need to be a secret.

### New Secret Required for Database Migrations

You must add one secret for automatic database migrations:

#### SUPABASE_ACCESS_TOKEN

This token authenticates the Supabase CLI to push migrations to your database.

**How to create:**

1. Go to https://app.supabase.com/account/tokens
2. Click **Generate new token**
3. Name it: `GitHub Actions Deployment`
4. **Scopes**: Keep the default scopes (should include `api`)
5. Click **Generate token**
6. Copy the token (you'll only see it once!)

**Add to GitHub:**

1. Go to your GitHub repo → **Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Name: `SUPABASE_ACCESS_TOKEN`
4. Value: (paste the token from step 6 above)
5. Click **Add secret**

**Security Note**: This token is used only in GitHub Actions to push migrations. Keep it:
- Private and never commit to code
- Only visible to this repository

## Deployment Workflow

### Automatic Deployment (On Every Push to main)

1. Push code to GitHub main branch
   ```bash
   git push origin main
   ```

2. GitHub Actions automatically:
   - ✅ Runs quality gates (ESLint, Jest, coverage, security audit)
   - ✅ Applies any pending database migrations
   - ✅ Builds the Expo Web export
   - ✅ Deploys to Cloudflare Pages

3. View the deployment:
   - Check **GitHub > Actions** for build status
   - App lives at: https://haulinlogs.github.io/LawnBudAI/

### Manual Database Migration (Emergency Only)

If you need to apply migrations manually without deploying the app:

```bash
# Ensure you're authenticated with Supabase
supabase login

# Link to your project (if not already linked)
cd LawnBudAI
supabase link --project-ref kzycwqjcqcmenlwswhnf

# Push migrations
supabase db push
```

## Creating Database Migrations

### For New Features

1. Create the migration file:
   ```bash
   cd LawnBudAI
   supabase migration new add_user_preferences
   ```

2. Edit `supabase/migrations/YYYYMMDDHHMMSS_add_user_preferences.sql`

3. Test locally:
   ```bash
   supabase start
   supabase db push
   yarn test:playwright
   supabase stop
   ```

4. Commit and push:
   ```bash
   git add supabase/migrations/
   git commit -m "#ISSUE: Add user preferences table"
   git push origin main
   ```

5. GitHub Actions will automatically apply the migration during deployment

### Migration Best Practices

- **One migration per feature** - Don't combine unrelated changes
- **Test locally first** - Always run `supabase start` and test before pushing
- **Use IF NOT EXISTS** - Prevents errors if migration runs twice
- **Never modify past migrations** - Create new ones instead
- **Include RLS policies** - All user data should be protected with Row Level Security
- **Add comments** - Document what the migration does

Example migration:

```sql
-- Add user preferences table for city/state storage
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  city text not null default 'Madison',
  state text not null default 'WI',
  timezone text default 'America/Chicago',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.user_preferences enable row level security;

-- Users can only read their own preferences
create policy "Users read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

-- Users can update their own preferences
create policy "Users update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast lookups
create index idx_user_preferences_user_id on public.user_preferences(user_id);
```

## Monitoring Deployments

### GitHub Actions Dashboard

1. Go to your GitHub repo
2. Click **Actions** tab
3. View workflow runs:
   - ✅ **Green checkmark** = Success
   - ❌ **Red X** = Failed
   - ⏳ **Yellow circle** = In progress

Click any run to see detailed logs for each step.

### What to Look For

**Successful deployment includes:**
```
✓ Run quality gates
✓ Setup Supabase CLI
✓ Apply database migrations
✓ Build Expo web export
✓ Deploy to Cloudflare Pages
```

**If migrations fail:**
- Check GitHub Actions logs for error messages
- Verify SUPABASE_ACCESS_TOKEN and SUPABASE_DB_PASSWORD are correct
- Check that migration file syntax is valid SQL
- Run `supabase db push` locally to test the migration

## Environment Variables

### Development (.env.local)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your-password
```

### Production (GitHub Secrets)

Secrets are automatically injected during the GitHub Actions workflow:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_ACCESS_TOKEN` (migrations only)
- `SUPABASE_DB_PASSWORD` (migrations only)
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_PROJECT_NAME`

## Troubleshooting

### Deployment Fails with "SUPABASE_ACCESS_TOKEN not found"

1. Check that `SUPABASE_ACCESS_TOKEN` is set in GitHub Secrets
2. Verify the token hasn't expired (tokens expire after 24 hours)
3. Generate a new token at https://app.supabase.com/account/tokens

### Deployment Fails with "Authentication failed"

1. Verify `SUPABASE_ACCESS_TOKEN` is a valid personal access token
2. Ensure the token has `api` and `database` scopes
3. Try manually pushing migrations locally to verify credentials work

### Database Migration Hangs

1. Check GitHub Actions logs for actual error message
2. Verify migration SQL syntax is valid
3. Test locally: `supabase start` → `supabase db push`
4. Check Supabase project status at https://status.supabase.com

### Cloudflare Pages Deployment Fails

1. Verify `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
2. Ensure `CLOUDFLARE_PROJECT_NAME` matches your Pages project
3. Check Cloudflare Pages dashboard for project status

## Next Steps

1. ✅ Add `SUPABASE_ACCESS_TOKEN` to GitHub Secrets (only 1 secret needed!)
2. ✅ Push code to main branch
3. ✅ Watch GitHub Actions for automatic deployment
4. ✅ Verify migrations applied: Check Supabase dashboard Tables section
5. ✅ Test the live app: https://haulinlogs.github.io/LawnBudAI/

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
