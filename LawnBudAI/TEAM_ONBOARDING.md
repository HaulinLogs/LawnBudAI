# Team Onboarding - LawnBudAI Development

Welcome to the LawnBudAI development team! This guide helps you get started with development, understand our workflows, and contribute effectively.

## Quick Start (5 minutes)

### 1. Setup Your Development Environment

```bash
# Clone repository (if not already done)
git clone https://github.com/HaulinLogs/lawnbudai.git
cd LawnBudAI

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start
```

### 2. Create a Feature Branch

```bash
# Create branch for your task (Phase 3.3 example)
git checkout -b phase-3.3/fertilizer-screen

# Work on code and tests
# (Write tests first! See TDD.md)

# Commit changes
git add .
git commit -m "Feature: Add fertilizer tracking screen"

# Push to GitHub
git push origin phase-3.3/fertilizer-screen
```

### 3. Create Pull Request

1. Go to **GitHub** → **LawnBudAI** → **Pull Requests**
2. Click **New Pull Request**
3. Compare: `your-branch` → `main`
4. Fill in title and description
5. Assign to yourself
6. Add labels (feature, bug, etc.)
7. Link to GitHub Project item

### 4. Quality Gates Auto-Check

GitHub Actions automatically:
- ✅ Runs ESLint
- ✅ Runs all tests
- ✅ Checks coverage (70% minimum)
- ✅ Runs security audit

**If checks fail:** Fix issues and push again (auto-retests)

### 5. Code Review & Merge

1. Team reviews your code
2. Request changes or approve
3. After approval, merge to main
4. Cloudflare Pages auto-deploys to production

## Development Workflow

### Phase-Based Development

Each phase has specific deliverables:

- **Phase 0.5**: Testing infrastructure (DONE ✅)
- **Phase 1**: Authentication (DONE ✅)
- **Phase 2.0**: RBAC + Rate Limiting (DONE ✅)
- **Phase 2.5**: SQLite Removal (DONE ✅)
- **Phase 3.0**: TDD Enforcement (DONE ✅)
- **Phase 3.1**: Mowing Screen (DONE ✅)
- **Phase 3.2**: Watering Screen (DONE ✅)
- **Phase 3.3**: Fertilizer Screen (⏳ IN PROGRESS)
- **Phase 3.4**: Shared Components & Testing (⏳ PENDING)

### TDD Development (Test-Driven Development)

**Critical:** All code must have tests before implementation!

```
1. Write Tests
   ├─ Unit tests for hooks/utilities
   ├─ Component tests for UI
   └─ E2E tests for user flows

2. Implement Feature
   ├─ Make tests pass
   ├─ Handle edge cases
   └─ Follow existing patterns

3. Verify Quality
   ├─ npm run lint:fix  (auto-fix linting)
   ├─ npm run testFinal (verify all tests)
   ├─ npm run test:coverage (70% minimum)
   └─ git push (pre-push hook verifies all)
```

### Testing Commands

```bash
# Watch mode - only changed tests
npm run test

# Debug mode - verbose output
npm run testDebug

# All tests once (before commit)
npm run testFinal

# Coverage report
npm run test:coverage

# E2E tests
npm run test:playwright

# All quality checks
npm run quality-gates
```

### Git Hooks (Automatic)

**Pre-commit hook** (runs before `git commit`):
- Auto-fixes ESLint issues
- Runs Prettier formatter
- Prevents committing broken code

**Pre-push hook** (runs before `git push`):
- Full linting check (0 errors, 0 warnings)
- All tests passing
- Coverage thresholds met (70%)
- Security audit (no vulnerabilities)

**If hooks fail:** Fix issues and try again (no force-pushing!)

## GitHub Projects (Team Dashboard)

Track all work in GitHub Projects:

1. **Access**: Go to **HaulinLogs** org → **Projects** → **LawnBudAI Development**
2. **View all active tasks** organized by:
   - Phase (3.1, 3.2, 3.3, 3.4)
   - Priority (Critical, High, Medium, Low)
   - Status (Todo, In Progress, Review, Done)

### Daily Workflow

1. **Morning**: Check project for assigned items
2. **Work**: Create PR linked to GitHub issue
3. **Before push**: Run `npm run quality-gates`
4. **Push**: Triggers GitHub Actions + Cloudflare deploy
5. **Evening**: Code review team PRs

### Issue Linking in PR

When creating PR, link to GitHub issue:

```markdown
# PR Description

Closes #123  # Links to GitHub issue

## Changes
- Added fertilizer form
- Created useFertilizerEvents hook
- Added statistics

## Testing
- Unit tests for hook (100% coverage)
- Component tests for form
- E2E test for complete flow
```

## Cloudflare Deployment

Automated deployment to Cloudflare Pages:

```
Your code (main branch)
    ↓
GitHub Actions runs Quality Gates
    ↓ (if success)
Deploys to Cloudflare Pages
    ↓
Live at: lawnbudai.pages.dev
```

### Deployment Process

1. **Push to main** → Automatic build starts
2. **Build completes** → Deployed to production
3. **Deployment live** → Team notified via Slack (optional)

### Environment Variables

Cloudflare Pages environment variables:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase database URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Public API key

These are configured in **Cloudflare Dashboard** → **Pages** → **lawnbudai** → **Settings** → **Environment variables**

### Preview Deployments

Each PR gets automatic preview deployment:
- URL: `https://pr-<number>.lawnbudai.pages.dev`
- Auto-commented on PR
- Share with team for testing

## Code Standards

### Naming Conventions

**Files**:
- Components: PascalCase (e.g., `MowingScreen.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useMowEvents.ts`)
- Utils: camelCase (e.g., `dateFormatter.ts`)
- Types: PascalCase (e.g., `events.ts` with `MowEvent` interface)

**Functions/Variables**:
- camelCase for functions and variables
- UPPER_CASE for constants
- Prefix private functions with underscore: `_privateFunction()`

### Component Structure

```typescript
// imports
import React from 'react';
import { View, Text } from 'react-native';

// types/interfaces
interface ComponentProps {
  title: string;
}

// component
export default function Component({ title }: ComponentProps) {
  // state
  const [state, setState] = useState();

  // effects
  useEffect(() => {
    // setup
  }, []);

  // handlers
  const handleClick = () => {};

  // render
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
```

### Error Handling

Always handle errors gracefully:

```typescript
// ❌ Bad
const result = await supabase.from('table').select();

// ✅ Good
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  return data;
} catch (err) {
  console.error('Failed to fetch data:', err);
  throw err;
}
```

### Testing

Every new function/component needs tests:

```typescript
describe('useMowEvents', () => {
  it('should fetch mowing events from Supabase', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Common Tasks

### Add a New Screen

1. Create `screens/<ScreenName>.tsx`
2. Create `hooks/use<Feature>Events.ts` (if data needed)
3. Create `models/events.ts` types (if new model)
4. Create tests: `__tests__/use<Feature>Events.test.ts`
5. Create component tests: `__tests__/<ScreenName>.test.tsx`
6. Add route to `app/(tabs)/_layout.tsx`
7. Create PR with all tests passing

### Update Existing Feature

1. Create branch: `git checkout -b fix/<feature-name>`
2. Write failing test first
3. Fix code to make test pass
4. Run quality gates: `npm run quality-gates`
5. Push and create PR
6. Get review and merge

### Debug Test Failures

```bash
# Run specific test file
npm run testDebug -- <path-to-file>.test.ts

# Run with verbose output
npm run testDebug -- --verbose

# Update snapshots (if test changed intentionally)
npm run updateSnapshots
```

## Team Communication

### Slack Channels (HaulinLogs)

- **#lawnbudai-dev**: Development discussions
- **#lawnbudai-deployments**: Deployment notifications
- **#lawnbudai-bugs**: Bug reports and fixes

### Weekly Standups

**Monday 10 AM**: Team sync
- What did you complete last week?
- What are you working on this week?
- Any blockers?

**Friday 4 PM**: Demo & review
- Demo completed features
- Review PRs
- Plan for next week

### GitHub Discussions

Use GitHub Issues for:
- Bug reports: Use `bug` label
- Feature requests: Use `enhancement` label
- Questions: Use `question` label

Use GitHub Discussions for:
- Architecture questions
- Best practices
- General guidance

## Troubleshooting

### Pre-push Hook Failing

```bash
# Check what's failing
npm run quality-gates

# Fix linting
npm run lint:fix

# Fix tests
npm run testDebug

# Try pushing again
git push
```

### Deployment Failed

1. Check GitHub Actions logs
2. Common issues:
   - Missing environment variables
   - Build error in Expo
   - Test failure in CI
3. Fix locally and push again

### Can't Push to Main

You should never push directly to main! Always:

1. Create feature branch
2. Create PR
3. Get review
4. Merge via GitHub UI

Direct pushes to main are blocked for protection.

## Learning Resources

- **TDD.md**: Complete testing guidelines
- **CLAUDE.md**: Project architecture and patterns
- **GITHUB_PROJECTS_SETUP.md**: Project management setup
- **CLOUDFLARE_DEPLOYMENT.md**: Deployment details

## Questions?

- Check existing documentation first
- Ask in Slack #lawnbudai-dev
- Schedule sync with team lead
- Create GitHub Discussion for architectural questions

## Summary

1. **Code**: Write tests first (TDD)
2. **Quality**: Pre-commit and pre-push hooks ensure quality
3. **Review**: Create PR and get team review
4. **Deploy**: Automatic deployment on merge to main
5. **Monitor**: Check Cloudflare deployment status

Welcome to the team! 🚀
