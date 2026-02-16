# Cloudflare Deployment for LawnBudAI

This guide sets up automated deployment of LawnBudAI (Expo Web export) to Cloudflare Pages with CI/CD integration.

## Architecture

```
GitHub (main branch)
    ↓
GitHub Actions CI/CD
    ↓ (on success)
Expo Export (web build)
    ↓
Upload to Cloudflare Pages
    ↓
Live at: lawnbudai-staging.pages.dev (or custom domain)
```

## Prerequisites

1. **Cloudflare Account**: Free or paid (Pages is free)
2. **GitHub Personal Access Token**: For deploying from CI/CD
3. **Custom Domain** (optional): For production deployment

## Step 1: Set Up Cloudflare Pages

### Option A: Connect GitHub Repository

1. Go to **Cloudflare Dashboard** → **Pages**
2. Click **Create a project** → **Connect to Git**
3. Authorize GitHub and select `LawnBudAI` repository
4. Configure build settings:
   - **Framework preset**: None (custom)
   - **Build command**: `yarn install && yarn expo export -p web`
   - **Build output directory**: `LawnBudAI/dist`
   - **Root directory**: `./`
5. Click **Save and deploy**

### Option B: Manual Setup (CI/CD Deployment)

If you want full control via GitHub Actions:

1. Go to **Cloudflare Dashboard** → **Pages**
2. Click **Create a project** → **Direct upload**
3. Name: `lawnbudai`
4. Upload the `dist/` folder
5. Note your project name for later

## Step 2: Generate Cloudflare Credentials

### API Token (for CI/CD)

1. Go to **Cloudflare Dashboard** → **Account Settings** → **API Tokens**
2. Click **Create Token**
3. Use template: "Cloudflare Pages – Deploy"
4. Permissions:
   - Account > Cloudflare Pages > Edit
   - Account > Deployments > Read
5. Copy the token → Save for Step 4

### Account ID

1. Go to **Cloudflare Dashboard** → **Account Settings** → **General**
2. Copy **Account ID** (long alphanumeric string)

## Step 3: Add GitHub Secrets

Store Cloudflare credentials as GitHub Secrets (encrypted):

1. Go to GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add secrets:
   ```
   CLOUDFLARE_ACCOUNT_ID: <your-account-id>
   CLOUDFLARE_API_TOKEN: <your-api-token>
   CLOUDFLARE_PROJECT_NAME: lawnbudai
   ```

## Step 4: Create Deployment Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_run:
    workflows: ["Quality Gates"]
    types: [completed]
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.event.workflow_run.conclusion == 'success' || github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18.x

      - name: Install dependencies
        run: yarn install
        working-directory: ./LawnBudAI

      - name: Build Expo web export
        run: yarn expo export -p web
        working-directory: ./LawnBudAI

      - name: Deploy to Cloudflare Pages
        run: |
          npm install -g wrangler
          wrangler pages deploy LawnBudAI/dist \
            --project-name=${{ secrets.CLOUDFLARE_PROJECT_NAME }} \
            --branch=main
        env:
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Step 5: Add Cloudflare Configuration

Create `wrangler.toml` in project root:

```toml
name = "lawnbudai"
main = "dist/index.js"
compatibility_date = "2024-01-01"

[env.production]
name = "lawnbudai-prod"
route = "https://lawnbudai.your-domain.com/*"

[env.staging]
name = "lawnbudai-staging"

[[migrations]]
tag = "v1"
new_classes = []
```

## Step 6: Environment Variables

### For Development
Create `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### For Cloudflare Pages

1. Go to **Cloudflare Dashboard** → **Pages** → **lawnbudai**
2. Go to **Settings** → **Environment variables**
3. Add variables (different per environment):

**Production:**
```
EXPO_PUBLIC_SUPABASE_URL=https://prod-supabase.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
```

**Preview (PR deployments):**
```
EXPO_PUBLIC_SUPABASE_URL=https://staging-supabase.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
```

## Step 7: Add Custom Domain (Optional)

To use your own domain instead of `lawnbudai.pages.dev`:

1. Go to **Cloudflare Dashboard** → **Pages** → **lawnbudai** → **Custom domains**
2. Click **Add custom domain**
3. Enter domain: `lawnbudai.haulinlogs.com` (or your domain)
4. Follow DNS setup instructions
5. Cloudflare manages SSL/TLS automatically

## Step 8: Preview Deployments on Pull Requests

Cloudflare automatically creates preview deployments for PRs:

1. Open a PR to `main`
2. Cloudflare creates preview URL (auto-commented on PR)
3. Preview URL format: `pr-<number>.lawnbudai.pages.dev`
4. Team members can test changes before merging

## Step 9: Deployment Workflow in Practice

### Development to Production

```
Developer creates PR
    ↓
GitHub Actions Quality Gates run
    ↓ (if all pass)
Cloudflare creates preview deployment
    ↓
Team reviews at pr-123.lawnbudai.pages.dev
    ↓
PR approved and merged to main
    ↓
GitHub Actions deploys to production
    ↓
Live at lawnbudai.pages.dev or custom domain
```

### Rollback

If deployment fails or has issues:

1. Go to **Cloudflare Dashboard** → **Pages** → **lawnbudai** → **Deployments**
2. Find previous working deployment
3. Click **Rollback to this deployment**
4. Automatic rollback takes ~1 minute

## Monitoring Deployments

### GitHub Actions

1. Go to **GitHub Actions** → **Deploy to Cloudflare Pages** workflow
2. Check each deployment run
3. View logs if deployment fails

### Cloudflare Dashboard

1. Go to **Pages** → **lawnbudai** → **Deployments**
2. Shows deployment history with:
   - Status (success/failed)
   - Deployed at timestamp
   - Deployment duration
   - Build logs

### Real User Monitoring (RUM)

Enable in Cloudflare:

1. **Pages** → **lawnbudai** → **Analytics**
2. View:
   - Page load times
   - User sessions
   - Error rates
   - Device/browser breakdown

## Troubleshooting

### Build Fails During Deployment

1. Check GitHub Actions logs for error
2. Common issues:
   - Missing environment variables
   - Node version mismatch
   - Supabase credentials invalid

Fix and push again - redeployment happens automatically.

### Preview URL Not Working

1. Verify PR is against `main` branch
2. Check Cloudflare Pages settings has GitHub integrated
3. Wait 2-3 minutes for deployment to complete
4. Check **Pages** → **Deployments** for status

### Custom Domain Not Resolving

1. Verify DNS records are correct in Cloudflare
2. Wait up to 24 hours for DNS propagation
3. Use `dig` command to check: `dig lawnbudai.haulinlogs.com`

## Security Considerations

### Secrets Management
- API tokens stored in GitHub Secrets (encrypted)
- Never commit `.env` files with real credentials
- Rotate tokens yearly

### CORS & Origin

Ensure Supabase CORS settings allow Cloudflare domain:

1. **Supabase Dashboard** → **Settings** → **API Settings** → **CORS**
2. Add: `https://lawnbudai.pages.dev`
3. Add preview domain: `https://*.lawnbudai.pages.dev`
4. Add custom domain: `https://your-domain.com`

### Rate Limiting

Set up Cloudflare Rate Limiting to prevent abuse:

1. **Pages** → **lawnbudai** → **Settings** → **Rate limiting**
2. Add rules (e.g., 100 requests/minute per IP)

## Advanced: Separate Staging Environment

For a staging deployment before production:

1. Create second Cloudflare Pages project: `lawnbudai-staging`
2. Create GitHub workflow for `staging` branch
3. Staging environment tests with production database
4. Production deployment only when staging verified

## Next Steps

1. Set up Cloudflare Pages project
2. Generate and store API credentials
3. Add GitHub deployment workflow
4. Deploy and test
5. Add custom domain
6. Monitor deployments

## References

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo Web Export Documentation](https://docs.expo.dev/distribution/publishing-websites/)
