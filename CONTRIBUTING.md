# Contributing to LawnBudAI

## Workflow Overview

All work on this project must be tracked via GitHub issues. This ensures:
- ✅ Clear project visibility
- ✅ Traceability of all changes
- ✅ Automatic linking of commits to issues
- ✅ Better collaboration and history

## Before You Start

1. **Create or assign a GitHub issue**
   - Check existing issues first (use search)
   - Create a new issue if needed with clear description
   - Assign it to yourself or the team member working on it
   - Add it to the appropriate milestone

2. **Update issue status**
   - Move to "In Progress" when you start work
   - Update with progress notes if work takes multiple days
   - Move to "In Review" when ready for testing

## Commit Message Format

**All commits MUST reference a GitHub issue.**

### Format
```
#ISSUE_NUMBER: Brief description of change

Longer explanation of what was changed and why.

Closes #ISSUE_NUMBER
```

### Examples

✅ **Good:**
```
#6: Fix fertilizer screen import typo

The fertilizer routing file was importing from FertlizerScreen
(typo) instead of FertilizerScreen. This has been corrected
and the duplicate file removed.

Closes #6
```

✅ **Good:**
```
#8: Update wrangler config for static site deployment

Reconfigure wrangler.toml to properly serve static Expo
exports via Cloudflare Pages instead of looking for a Worker
entry point. Add site bucket configuration.

Closes #8
```

❌ **Bad:**
```
fix bug
```

❌ **Bad:**
```
#6: Changes to fertilizer screen
```
(Closes line is required for automatic issue linking)

### Key Rules

1. **Start with issue number**: `#ISSUE_NUMBER: `
2. **Keep summary short**: First line ~50 characters
3. **Use imperative mood**: "Fix", "Add", "Update", not "Fixed", "Added"
4. **Include `Closes #X`**: This auto-links and closes the issue when merged
5. **One issue per commit**: If you're addressing multiple issues, use separate commits

## Pre-Commit Hook Validation

Husky will automatically validate your commit message before committing:
- ✅ Checks for GitHub issue reference (`#NUMBER`)
- ✅ Validates issue exists and is open
- ✅ Ensures `Closes #X` is in the message body

If validation fails, fix the commit message and try again:
```bash
git commit --amend
```

## Typical Workflow

1. **Create/assign issue**
   ```
   Issue #6: Phase 3.3: Fertilizer Screen
   Status: In Progress
   Assigned: You
   ```

2. **Make changes locally**
   ```bash
   git checkout -b work/fertilizer-screen
   # ... make changes ...
   ```

3. **Commit with issue reference**
   ```bash
   git add .
   git commit -m "#6: Implement fertilizer screen with CRUD operations

   - Add form for logging fertilizer events
   - Implement data persistence to Supabase
   - Add statistics calculations
   - Add type breakdown display

   Closes #6"
   ```

4. **Push and verify**
   ```bash
   git push
   ```
   GitHub will automatically:
   - Link commit to issue #6
   - Show commit in the issue timeline
   - Allow closing issue with the Closes keyword

5. **Mark issue as complete**
   - Move issue to "Done"
   - Add closing comment if needed
   - Archive or close the issue

## Testing Before Commit

Run the quality gates before committing:

```bash
# Run all tests
npm run testFinal

# Check linting
npm run lint:ci

# Check coverage
npm run test:coverage

# Run full quality gates (runs on pre-push)
npm run quality-gates
```

## Questions?

- Check existing issues and closed PRs for similar work
- Review CLAUDE.md for project architecture
- Ask in GitHub issue comments for clarification
- Check the implementation plan for scope and timeline

---

**Remember:** Every commit tells a story. Make it clear what issue it solves and why.
