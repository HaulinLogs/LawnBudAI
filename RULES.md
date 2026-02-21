# 🚫 Non-Negotiable Rules

**Source of truth for all team members.** Referenced in CLAUDE.md, .cursorrules, and enforced across all AI tools (Claude Code, Cursor, etc).

These rules are **not suggestions** - they are **mandatory** and must be followed consistently. When any rule is about to be broken, stop and ask for clarification instead.

---

## 1. Research-First Before Implementation

**ALWAYS research and plan before writing code.** No assumptions allowed.

- ❌ **Never start implementation without research:**
  - Guessing at how Supabase migrations work, then iterating through 5 failures
  - Assuming a tool works a certain way without checking docs
  - "I'll figure it out as I go"

- ✅ **Always do this first:**
  1. Use **Context7 MCP** to query official documentation
  2. Use **WebSearch** if Context7 doesn't have the answer
  3. **Document your findings** before implementing
  4. **Show the user the evidence** and ask if the approach looks right
  5. Only then implement

**Example:**
```
❌ WRONG: "Let me add the migration step to the workflow"
✅ RIGHT: "Let me research how Supabase migrations work in GitHub Actions first. I'll check Context7 for the official docs."
```

---

## 2. All Test Execution Must Use Subagents

**NEVER run tests directly with Bash. Always use the Task tool with a subagent.**

- ❌ **Never do this:**
  ```bash
  yarn test:playwright
  cd /path && npm test
  ```

- ✅ **Always do this:**
  ```
  Use Task tool with subagent_type: "Bash"
  Provide clear instructions for running tests
  Set run_in_background: true if it takes time
  ```

**Why:** Using subagents provides better isolation, cleaner context, and ensures tests aren't polluting the main conversation.

---

## 3. Environment Variables Must Be Sourced, Never Exposed

**NEVER put credentials or sensitive values on command lines. Always source them from .env files.**

- ❌ **Never do this:**
  ```bash
  TEST_USER_EMAIL=test@example.com TEST_USER_PASSWORD=secret! yarn test:playwright
  ```

- ✅ **Always do this:**
  ```bash
  source .env.local && yarn test:playwright
  ```

**Why:** Command line history is visible to anyone with shell access. Sourcing files keeps credentials private.

---

## 4. Evidence-Based Claims Only

**NEVER claim a change is done without proof. Always verify and show evidence.**

- ❌ **Never do this:**
  - "I updated the migration file" (without showing the updated content)
  - "The tests passed" (without showing test output)
  - "The database was migrated successfully" (without querying to verify)

- ✅ **Always do this:**
  1. Make the change
  2. Read the file/output after the change
  3. Show the actual evidence (file contents, query results, test output)
  4. Explain what the evidence proves
  5. Flag any assumptions that weren't verified

---

## 5. When in Doubt, Ask First

**NEVER proceed with uncertainty. Always ask the user to clarify before acting.**

- ❌ **Never do this:**
  - Assuming you understand what the user wants and proceeding
  - Trying multiple approaches hoping one works
  - Making decisions that aren't explicitly requested

- ✅ **Always do this:**
  - "I'm about to do X. Is that what you want?"
  - "I need clarification on Y before proceeding"
  - "Should I use approach A or approach B?"

---

## 6. Consistency Matters

**If you broke a rule and the user corrected you, that correction applies going forward. Don't repeat the mistake.**

- ❌ **Never do this:**
  - User says "use subagents for tests"
  - You acknowledge and... then run tests with Bash directly
  - "Oops, I did it again"

- ✅ **Always do this:**
  - User corrects behavior
  - Immediately implement the correction
  - Never break the same rule twice in a session

---

**If any of these rules are about to be broken, STOP and ask for permission first.**
