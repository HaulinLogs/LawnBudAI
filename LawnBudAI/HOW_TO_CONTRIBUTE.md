# How to Contribute to LawnBudAI

Guide for developers and AI coding assistants (Claude Code, Cursor, Gemini, OpenCode, etc.) to contribute effectively.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Branch Strategy](#branch-strategy)
3. [Development Workflow](#development-workflow)
4. [TDD Development Process](#tdd-development-process)
5. [Code Review Process](#code-review-process)
6. [Using AI Assistants](#using-ai-assistants)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

## Development Setup

### Prerequisites

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm 9+ (comes with Node.js)
- Git ([git-scm.com](https://git-scm.com))
- GitHub account with HaulinLogs organization access

### Initial Setup (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/HaulinLogs/lawnbudai.git
cd LawnBudAI

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Verify setup
yarn lint:ci          # Should show 0 errors, 0 warnings
yarn testFinal        # Should show 36/36 tests passing

# 4. Start development
npm start
```

### IDE Configuration

#### For Claude Code (claude.ai/code)

```bash
# 1. Open in Claude Code
# Go to claude.ai/code and upload the repository

# 2. Key commands available:
yarn test             # Run tests in watch mode
yarn lint:fix         # Auto-fix linting issues
yarn testDebug        # Debug failing tests
yarn quality-gates    # Run all checks

# 3. Read project files for context:
# - ARCHITECTURE.md (system design)
# - TDD.md (testing requirements)
# - CLAUDE.md (development patterns)
```

#### For Cursor IDE

```
# 1. Open project in Cursor
cursor .

# 2. Set up .cursor/rules.md with:
# - See CONTRIBUTING_CURSOR.md for IDE-specific settings

# 3. Use Cursor's AI features:
# - Cmd+K: Ask AI to edit code
# - Cmd+L: Chat with AI about code
# - @workspace: Reference entire workspace
```

#### For Gemini (via GenAI Studio or API)

```
# 1. Install Gemini API client
npm install @google/generative-ai

# 2. Set up authentication with API key
# Export GOOGLE_API_KEY environment variable

# 3. Use in development:
# - Reference project structure in prompts
# - Include file paths for context
# - Ask specific questions about implementation
```

#### For OpenCode

```
# 1. Open project in OpenCode
opencode .

# 2. Configuration:
# - Check .opencode/config.json for settings

# 3. Features:
# - Code suggestions
# - Test generation
# - Documentation
```

## Branch Strategy

### Naming Convention

```
<type>/<phase>/<description>

Examples:
- feature/3.3/fertilizer-screen
- fix/3.1/mowing-validation
- test/3.2/watering-e2e-tests
- docs/tdd-guidelines
```

### Branch Types

| Type | Purpose | Example |
|------|---------|---------|
| `feature` | New functionality | feature/3.3/fertilizer-screen |
| `fix` | Bug fixes | fix/mowing-date-parsing |
| `test` | Tests only | test/water-events-coverage |
| `docs` | Documentation | docs/api-integration |
| `refactor` | Code improvements | refactor/extract-form-component |

### Creating a Branch

```bash
# Create and switch to branch
git checkout -b feature/3.3/fertilizer-screen

# Verify you're on correct branch
git branch --show-current

# Push to remote to backup work
git push -u origin feature/3.3/fertilizer-screen
```

## Development Workflow

### Before You Start

1. **Read the requirements** for your phase/task
2. **Read ARCHITECTURE.md** to understand system design
3. **Read CLAUDE.md** for development patterns
4. **Read TDD.md** for testing approach

### During Development

```bash
# 1. Create feature branch
git checkout -b feature/3.3/fertilizer-screen

# 2. Write tests first (TDD)
# See TDD.md for detailed process

# 3. Run tests in watch mode
yarn test

# 4. Implement feature
# Follow existing patterns in codebase

# 5. Run linting
yarn lint:fix

# 6. Commit changes (pre-commit hook auto-formats)
git add .
git commit -m "Feature: Add fertilizer screen"

# 7. Verify quality gates (pre-push hook runs automatically)
git push origin feature/3.3/fertilizer-screen

# If pre-push hook fails:
yarn quality-gates   # Identify issues
yarn lint:fix        # Fix linting
yarn testFinal       # Verify tests
git push                # Try again
```

### Key Git Commands

```bash
# View current status
git status

# View commits on your branch
git log --oneline origin/main..HEAD

# View changes before staging
git diff

# View staged changes
git diff --staged

# Unstage files
git restore --staged <file>

# Discard local changes (careful!)
git restore <file>

# Update branch from main
git fetch origin
git rebase origin/main

# View remote branches
git branch -r
```

## TDD Development Process

### Step 1: Understand Requirements

```
Example (Phase 3.3 - Fertilizer Screen):
- Record fertilizer applications
- Track application date, type, amount
- Display history of applications
- Calculate statistics (last application, frequency)
- User data isolation via Supabase RLS
```

### Step 2: Write Tests First

```typescript
// __tests__/useFertilizerEvents.test.ts
describe('useFertilizerEvents', () => {
  beforeEach(() => {
    // Mock Supabase
    jest.mock('@/lib/supabase');
  });

  it('should fetch fertilizer events from Supabase', async () => {
    // Arrange: Set up test data
    const mockUser = { id: 'user-123' };
    const mockEvents = [
      {
        id: '1',
        user_id: 'user-123',
        date: '2026-02-01',
        type: 'nitrogen',
        amount_lbs: 10,
        notes: 'Spring application',
      },
    ];

    // Act: Call the function
    const { result } = renderHook(() => useFertilizerEvents());
    await waitFor(() => !result.current.loading);

    // Assert: Verify results
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.error).toBeNull();
  });

  it('should add a new fertilizer event', async () => {
    // Similar Arrange-Act-Assert pattern
  });

  it('should calculate last application date', async () => {
    // Test statistics calculation
  });
});
```

### Step 3: Run Tests (They Fail)

```bash
yarn test
# Tests will fail - this is expected!
# Error: useFertilizerEvents is not implemented
```

### Step 4: Implement Feature

```typescript
// hooks/useFertilizerEvents.ts
export function useFertilizerEvents() {
  const [events, setEvents] = useState<FertilizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('fertilizer_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  // ... more methods (addEvent, deleteEvent, getStats)

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, addEvent, deleteEvent, getStats };
}
```

### Step 5: Run Tests (They Pass)

```bash
yarn testFinal
# ✓ All tests passing!
```

### Step 6: Implement UI

```typescript
// screens/FertilizerScreen.tsx
export default function FertilizerScreen() {
  const { events, addEvent, deleteEvent, getStats } = useFertilizerEvents();
  const [date, setDate] = useState('');
  const [type, setType] = useState<'nitrogen' | 'phosphorus' | 'potassium' | 'balanced'>('nitrogen');
  const [amount, setAmount] = useState('');

  // Form, history, stats rendering
}
```

### Step 7: Test UI Component

```typescript
// __tests__/FertilizerScreen.test.tsx
describe('FertilizerScreen', () => {
  it('should display form for recording application', () => {
    const { getByPlaceholderText } = render(<FertilizerScreen />);
    expect(getByPlaceholderText('YYYY-MM-DD')).toBeTruthy();
  });

  it('should submit fertilizer event', async () => {
    // Component test
  });
});
```

### Step 8: Quality Gates

```bash
# Auto-fix linting
yarn lint:fix

# Verify all tests pass
yarn testFinal

# Check coverage
yarn test:coverage
# Target: 70% minimum

# Verify no vulnerabilities
npm audit

# If all pass:
git add .
git commit -m "Feature: Add fertilizer screen with tests"
git push
```

## Code Review Process

### Creating a Pull Request

1. **Push to remote**:
   ```bash
   git push origin feature/3.3/fertilizer-screen
   ```

2. **Go to GitHub**:
   - URL: github.com/HaulinLogs/lawnbudai
   - Click "Compare & pull request"

3. **Fill in PR details**:
   ```markdown
   # Title
   Feature: Add fertilizer screen (Phase 3.3)

   # Description
   - Created FertilizerScreen.tsx component
   - Implemented useFertilizerEvents hook with CRUD operations
   - Added comprehensive test coverage
   - Linked to GitHub issue #45

   # Type of Change
   - [x] New feature
   - [ ] Bug fix
   - [ ] Breaking change

   # Testing
   - [x] Unit tests (100% coverage)
   - [x] Component tests
   - [x] E2E test added
   - [x] All tests passing locally

   Closes #45
   ```

4. **Link to GitHub Project**:
   - Select project: "LawnBudAI Development"
   - Set status: "In Review"

### Code Review Checklist

Reviewers check:
- ✅ Tests pass (36/36 + new tests)
- ✅ Coverage maintained (70%+)
- ✅ ESLint clean (0 errors, 0 warnings)
- ✅ No security issues
- ✅ Follows project patterns
- ✅ Handles errors gracefully
- ✅ User-friendly error messages
- ✅ Documentation updated (if needed)

### Responding to Review

```bash
# If reviewer requests changes:
1. Make changes locally
2. Run tests: yarn testFinal
3. Commit: git commit -m "address: feedback from review"
4. Push: git push

# GitHub will update PR automatically
# Reviewer will re-check and approve
```

### Merging PR

1. Reviewer clicks "Approve"
2. Click "Squash and merge" (single commit per feature)
3. Delete branch (GitHub offers option)

```bash
# After merge, sync local
git checkout main
git pull origin main
git branch -d feature/3.3/fertilizer-screen
```

## Using AI Assistants

### Claude Code (claude.ai/code)

**Best For:**
- Complex multi-file changes
- Architecture decisions
- Test generation
- Documentation

**How to Use:**

1. **Setup Context**:
   ```
   Read these files for context:
   - ARCHITECTURE.md (system design)
   - TDD.md (testing requirements)
   - CLAUDE.md (development patterns)
   - models/events.ts (data types)
   ```

2. **Ask Specific Questions**:
   ```
   Q: "How should I implement useFertilizerEvents following
       the pattern in useMowEvents?"

   Q: "Write comprehensive tests for fertilizer event CRUD
       following the pattern in existing hook tests"

   Q: "Generate FertilizerScreen.tsx following MowingScreen.tsx pattern"
   ```

3. **Provide Context**:
   ```
   "I'm implementing Phase 3.3: Fertilizer Screen.
    The pattern should match useMowEvents and MowingScreen.
    The database table is fertilizer_events with fields:
    date, type (nitrogen/phosphorus/potassium/balanced),
    amount_lbs, notes"
   ```

4. **Request Verification**:
   ```
   "Verify this code:
    - Follows existing patterns
    - Has proper TypeScript types
    - Includes error handling
    - Works with Supabase RLS"
   ```

**Key Commands:**
```
/read <file>          # Read file for context
/grep <pattern>       # Search codebase
/diff <file>          # Show changes
/commit               # Create git commit
```

### Cursor IDE

**Best For:**
- Code completion
- Real-time suggestions
- Refactoring
- Local debugging

**How to Use:**

1. **Cmd+K**: Edit code with AI
   ```
   Select code → Cmd+K → "Add error handling"
   ```

2. **Cmd+L**: Chat about code
   ```
   Ask questions about implementation
   Cursor references selected code in chat
   ```

3. **@workspace**: Reference whole project
   ```
   "Based on @workspace patterns, how should I...?"
   ```

4. **@web**: Search documentation
   ```
   "@web Supabase Row Level Security examples"
   ```

### Gemini (GenAI Studio / API)

**Best For:**
- Quick code snippets
- Algorithm questions
- General guidance

**How to Use:**

```javascript
// In your development scripts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function askAboutCode(question) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent({
    contents: [{
      parts: [{
        text: `Project: LawnBudAI React Native Expo app with Supabase.
               Architecture in ARCHITECTURE.md. Question: ${question}`
      }]
    }]
  });
  console.log(result.response.text());
}
```

### OpenCode

**Best For:**
- Code suggestions
- Inline documentation
- Quick fixes

**Use in OpenCode editor:**
- Hover over code → "Explain"
- Select code → "Generate tests"
- Right-click → "Refactor"

### Context7 MCP Server (In Any AI Assistant)

**LawnBudAI uses Context7 for documentation lookup:**

```
The project includes @upstash/context7-mcp for querying
library documentation during development.

Usage in Claude Code:
- Look up Supabase docs: /context7 supabase row level security
- Look up Expo docs: /context7 expo navigation patterns
- Look up React docs: /context7 react hooks useEffect
- Look up Jest docs: /context7 jest testing library
```

**Example Queries:**
```
Q: How do I set up Row Level Security in Supabase?
A: /context7 supabase RLS policies examples

Q: What's the correct way to use React useEffect in hooks?
A: /context7 react hooks useEffect cleanup

Q: How do I write E2E tests with Playwright?
A: /context7 playwright assertions test structure
```

## Common Patterns

### 1. Creating a New Screen

**File Structure:**
```
screens/
  ├─ FertilizerScreen.tsx
  └─ MowingScreen.tsx (reference pattern)

hooks/
  ├─ useFertilizerEvents.ts
  └─ useMowEvents.ts (reference pattern)

__tests__/
  ├─ useFertilizerEvents.test.ts
  ├─ FertilizerScreen.test.tsx
  └─ (reference existing tests)
```

**Steps:**
1. Copy MowingScreen.tsx as template
2. Adapt component for fertilizer data
3. Copy useMowEvents.ts as hook template
4. Implement CRUD for fertilizer_events table
5. Write tests first, then implement
6. Follow error handling pattern

### 2. Adding a New Data Type

**Files to Update:**
```
models/events.ts          # Add interface + input type
hooks/useFertilizerEvents.ts  # CRUD operations
screens/FertilizerScreen.tsx   # UI component
__tests__/                     # Tests
```

**Pattern:**
```typescript
// models/events.ts
export interface FertilizerEvent {
  id: string;
  user_id: string;
  date: string;
  type: 'nitrogen' | 'phosphorus' | 'potassium' | 'balanced';
  amount_lbs: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FertilizerEventInput {
  date: string;
  type: 'nitrogen' | 'phosphorus' | 'potassium' | 'balanced';
  amount_lbs: number;
  notes?: string;
}
```

### 3. Adding a Component

**Template:**
```typescript
interface Props {
  title: string;
  // Add other props
}

export default function Component({ title }: Props) {
  // State
  const [state, setState] = useState();

  // Effects
  useEffect(() => {}, []);

  // Handlers
  const handleEvent = () => {};

  // Render
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
```

## Troubleshooting

### Pre-commit Hook Issues

```bash
# Error: "Command not found: npx"
# Fix: npm install -g npx

# Error: "lint-staged: not found"
# Fix: npm install --legacy-peer-deps

# Pre-commit hook not running
# Fix: npx husky install
```

### Test Failures

```bash
# View detailed error
yarn testDebug -- <test-file>

# Update snapshots (if intentional)
yarn updateSnapshots

# Run specific test
yarn testDebug -- -t "should add event"
```

### Linting Errors

```bash
# View all issues
yarn lint:ci

# Auto-fix most issues
yarn lint:fix

# For remaining issues, edit manually
```

### Supabase Connection Issues

```typescript
// Check if auth is working
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Check if queries work
const { data, error } = await supabase
  .from('mow_events')
  .select('*')
  .limit(1);
console.log('Query result:', data, error);
```

### Deployment Issues

```bash
# Check if build works
npx expo export -p web

# Verify environment variables
echo $EXPO_PUBLIC_SUPABASE_URL
echo $EXPO_PUBLIC_SUPABASE_ANON_KEY

# Check for TypeScript errors
npx tsc --noEmit
```

## Need Help?

1. **Check documentation**:
   - ARCHITECTURE.md (system design)
   - TDD.md (testing)
   - CLAUDE.md (patterns)
   - TEAM_ONBOARDING.md (workflow)

2. **Ask in Slack**:
   - #lawnbudai-dev (general questions)
   - #lawnbudai-bugs (issues)

3. **Use AI Assistant**:
   - Claude Code: Complex architectural questions
   - Cursor: Real-time code help
   - Gemini: Quick snippets
   - Context7: Library documentation

4. **Create GitHub Issue**:
   - Label: `question` or `help wanted`
   - Include code snippet if applicable

## Summary

1. **Setup**: Clone → npm install → yarn test
2. **Branch**: Create feature branch with descriptive name
3. **TDD**: Write tests first, implement second
4. **Code**: Follow existing patterns
5. **Quality**: Run yarn quality-gates
6. **Review**: Create PR and get team review
7. **Merge**: Squash merge to main

Happy coding! 🚀

---

**Document Version:** 1.0
**Last Updated:** 2026-02-16
**Supported AI Assistants:** Claude Code, Cursor, Gemini, OpenCode
