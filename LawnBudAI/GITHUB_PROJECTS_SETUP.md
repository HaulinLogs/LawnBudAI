# GitHub Projects Setup for LawnBudAI

This guide explains how to set up GitHub Projects to track LawnBudAI development work within the HaulinLogs organization.

## Prerequisites

- HaulinLogs GitHub organization access
- Repository owner or admin permissions
- Team members invited to organization

## Step 1: Create GitHub Project

1. Go to **HaulinLogs Organization** → **Projects** tab
2. Click **New Project** button
3. Select **Table** template (best for task management)
4. Name it: `LawnBudAI Development`
5. Description: `Track development progress for LawnBudAI lawn care management app`
6. **Access**: Set to **Internal** (not public)
7. Click **Create project**

## Step 2: Configure Project Fields

Add custom fields to track:
- **Phase**: Single select (Phase 0.5, 1, 2.0, 2.5, 3.0, 3.1, 3.2, 3.3, 3.4)
- **Priority**: Single select (Critical, High, Medium, Low)
- **Effort**: Single select (1pt, 2pt, 3pt, 5pt, 8pt)
- **Status**: Auto-set by workflow (Todo, In Progress, Review, Done)
- **Assignee**: User field (automatically synced with issues)

## Step 3: Map Worktracker Tasks to GitHub Issues

### Phase 3 Tasks

Create GitHub Issues for each Phase 3 task and link to project:

#### Issue 1: Phase 3.1 - Build Mowing Screen ✅ COMPLETED
```
Title: Phase 3.1: Build Mowing Screen
Phase: 3.1
Status: Done
Effort: 5pts
Description:
- Implement MowingScreen.tsx with form inputs (date, height)
- Create useMowEvents hook with CRUD operations
- Add statistics calculation (days since, average height)
- Create event history display with delete functionality
- Add TypeScript interfaces in models/events.ts
```

#### Issue 2: Phase 3.2 - Build Watering Screen ✅ COMPLETED
```
Title: Phase 3.2: Build Watering Screen
Phase: 3.2
Status: Done
Effort: 8pts
Description:
- Implement WateringScreen.tsx with enhanced features
- Add source dropdown (sprinkler, manual, rain)
- Create useWaterEvents hook with CRUD + statistics
- Add monthly breakdown and source statistics
- Implement proper error handling and validation
```

#### Issue 3: Phase 3.3 - Build Fertilizer Screen ⏳ IN PROGRESS
```
Title: Phase 3.3: Build Fertilizer Screen
Phase: 3.3
Status: In Progress
Effort: 8pts
Priority: High
Description:
- Create FertilizerScreen.tsx component
- Implement useFertilizerEvents hook
- Add fertilizer type selector (nitrogen, phosphorus, potassium, balanced)
- Track fertilizer application history
- Statistics: last application, frequency analysis
```

#### Issue 4: Phase 3.4 - Shared Components & E2E Testing ⏳ PENDING
```
Title: Phase 3.4: Shared Components & Final Testing
Phase: 3.4
Status: Todo
Effort: 13pts
Priority: High
Description:
- Extract shared EventForm component
- Extract shared EventHistory component
- Extract shared Statistics component
- Run comprehensive E2E tests with Playwright
- Add mobile testing with Maestro
- Verify entire product workflow
```

## Step 4: Create Project Workflow Automation

GitHub Projects can auto-update issue status based on events:

1. Go to Project **Settings** → **Workflows**
2. **Enable automatically add items to project**
   - Select repository: `LawnBudAI`
   - When: Issues and Pull Requests
3. **Auto-archive items** when closed (optional)

## Step 5: Create Project Views

Create multiple views for different team perspectives:

### View 1: By Phase (Timeline View)
```
Sort by: Phase
Filter: Status != Done
Visibility: Shows all active work across phases
```

### View 2: By Priority (Priority View)
```
Group by: Priority
Sort by: Effort (desc)
Filter: Status != Done
Visibility: High-priority items first
```

### View 3: By Assignee (Team View)
```
Group by: Assignee
Filter: Status != Done
Visibility: Who's working on what
```

### View 4: Backlog (Roadmap View)
```
Filter: Status = Todo
Sort by: Phase, then Priority
Visibility: Future work planning
```

## Step 6: Invite Team Members

1. Go to Project → **Settings**
2. Click **Manage Access**
3. Search for team members from HaulinLogs org
4. Set role: **Editor** (can manage project items)
5. Team members get notification to join

## Step 7: Link Pull Requests to Issues

When creating a PR for a task, link it to the GitHub Issue:

```bash
# In PR description
Closes #<issue-number>
# Example: Closes #123
```

This automatically:
- Links PR to Issue
- Updates Project status when PR is reviewed
- Closes Issue when PR is merged

## Automation: Status Updates

Project status automatically changes based on:
- **Todo** → Issue created or reopened
- **In Progress** → Pull Request created
- **In Review** → Pull Request review requested
- **Done** → Pull Request merged or Issue closed

## Team Communication

### Daily Standup
Check project view each day:
1. What's in progress?
2. Any blockers in review?
3. What's next (from Todo)?

### Weekly Review
Review project metrics:
- Velocity: Points completed per week
- Burndown: Are we on track?
- Blockers: Any stuck items?

## Integration with CI/CD

GitHub Projects integrates with:
- **Quality Gates** (GitHub Actions workflow)
  - Tests must pass before merging PR
  - Coverage thresholds enforced
  - ESLint must pass
- **Deployment** (via Cloudflare Pages)
  - Automatic deployment on merge to main
  - Preview deployments on PR

See `CLOUDFLARE_DEPLOYMENT.md` for deployment setup.

## Making Project Internal (Not Public)

The project is internal by default in GitHub Projects. However, ensure:

1. Project visibility: **Internal** (visible to HaulinLogs org members only)
2. Repository visibility: **Private** (LawnBudAI repo should be private)
3. Team members: Only HaulinLogs employees with org access
4. External sharing: Use GitHub link access with expiration

To verify settings:
1. Go to Project → **Settings**
2. Check **Access** section shows "Internal"
3. Repository → **Settings** → **Visibility** = Private

## Troubleshooting

### Issue not appearing in project?
- Ensure issue is created in correct repository (LawnBudAI)
- Check project settings "automatically add items" is enabled
- Manually add issue via "Add item" button

### Status not updating?
- Verify pull request is linked to issue with "Closes #123"
- Check GitHub Actions workflow has completed
- Manual update: Click issue → change status field

### Can't access project?
- Ensure added to HaulinLogs organization as member
- Check organization settings - you should have member role
- Admin can invite via org settings

## Next Steps

1. Create project in HaulinLogs organization
2. Add Phase 3 issues (complete Phase 3.1 & 3.2 as Done)
3. Invite team members from HaulinLogs
4. Set up Cloudflare Pages deployment (see next doc)
5. Configure GitHub Actions to deploy on merge
