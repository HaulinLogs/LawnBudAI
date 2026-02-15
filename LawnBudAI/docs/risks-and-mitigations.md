# LawnBudAI Risks & Mitigations

## Risk Assessment Matrix

| Risk | Probability | Impact | Severity | Mitigation Priority |
|------|-------------|--------|----------|-------------------|
| Timeline slippage | Medium | High (May deadline) | **HIGH** | 1️⃣ |
| Low beta engagement | Medium | Medium (feedback loop) | **MEDIUM** | 2️⃣ |
| Security vulnerability (RLS bug) | Low | High (data breach) | **HIGH** | 2️⃣ |
| Supabase free tier limits | Low | Medium (upgrade cost) | **LOW** | 4️⃣ |
| App Store rejection | Low | High (launch delay) | **HIGH** | 3️⃣ |
| Database migration issues | Medium | High (data loss) | **HIGH** | 1️⃣ |
| Weather API downtime | Low | Low (graceful fallback) | **LOW** | 5️⃣ |
| Notification spam complaints | Medium | Medium (user churn) | **MEDIUM** | 2️⃣ |
| Solo developer burnout | Medium | High (project halt) | **HIGH** | 1️⃣ |
| Competing app launch | Low | Medium (market) | **LOW** | 5️⃣ |

---

## HIGH PRIORITY RISKS

### 1️⃣ Risk: Timeline Slippage (May BETA Deadline)

**Probability**: Medium (20-40 hrs of scope creep likely)
**Impact**: May deadline missed → Launch pushed to June or later
**Severity**: 🔴 **HIGH** — Seasonality matters (May is pre-summer lawn season)

#### Why This Happens
- Unexpected bugs in Supabase auth
- Complex notification scheduling issues
- Design tweaks taking longer than planned
- Scope creep (adding "just one more feature")

#### Mitigation Strategy

**1. Ruthless Scope Cutting (Start NOW)**
- Lock the feature list → No additions without removing something else
- Create a public ROADMAP showing what's in v1.0 vs. v1.1
- When tempted to add feature X, ask: "Does this block shipping?"
  - YES → Add now
  - NO → Defer to v1.1

**2. Weekly Velocity Tracking**
- Track hours spent vs. hours estimated per phase
- By week 2, you'll know if timeline is at risk
- Adjust immediately (cut features, extend hours, or both)

**3. Buffer Allocation**
- Phases 1-3: Strict timeline (41 hrs)
- Phase 4: Intentional buffer (30 hrs)
- If phase 4 starts late, phase 4 gets cut (defer polish to v1.0.1)

**4. Decision Rules**
- **By end of Week 2**: If behind 5+ hours → cut 1 feature
- **By end of Week 5**: If behind 10+ hours → cut notifications (push to v1.0.1)
- **By end of Week 7**: If behind 15+ hours → reduce notification polish

**5. What NOT to Cut**
- Authentication (required)
- 3 core screens (value)
- Data persistence (core)

**6. What TO Cut If Behind**
1. Notification preferences (auto to 8 AM only)
2. Advanced form validation (basic only)
3. Onboarding animations (text-based only)
4. Email support (link to FAQ instead)

#### Success Metric
- May 1: App submitted to TestFlight + Google Play Internal Testing

---

### 2️⃣ Risk: Low Beta Engagement (Testers Don't Use App)

**Probability**: Medium (typical for niche apps)
**Impact**: No real-world feedback → ship broken features
**Severity**: 🟠 **MEDIUM** — Delays feedback loop, makes launch risky

#### Why This Happens
- Selected wrong testers ("I'll maybe use it")
- App too buggy to use
- No clear instructions on what to test
- Competing demands on testers' time

#### Mitigation Strategy

**1. Tester Selection (Critical)**
- Only recruit testers who currently mow their own lawn
- Proof: Ask "When did you last mow? What height?" → Weeds out disinterested
- Prioritize testers in similar location (same weather, grass season)
- Target: 10-15 quality testers, not 50 mediocre ones

**2. Create Engagement Hooks**
- **Week 1**: Personal welcome call (10 min) for first 5 testers
  - Show them the app, explain what's being tested
  - Answer questions, build relationship
- **Weeks 2-4**: Daily Slack messages with specific asks
  - "Please try logging a mowing event tomorrow" (specific task)
  - Not "Let me know what you think" (vague, low engagement)
- **Weekly survey**: 2-minute Google Form (friction is key)
- **Reward**: Free Premium for 1 year (worth $24, costs you $0.01 to deliver)

**3. Start with Early Testing**
- Don't wait for full feature completion
- Even partial builds can be tested by tech-savvy testers
- "This is broken, but try signing up" → Feedback on auth flow

**4. If Engagement Drops**
- By week 3, if <30% are logging in → recruit 5 more testers
- By week 5, if <50% are logging events → switch to 1-on-1 testing (calls)
- If <70% engagement → Evaluate if app is actually useful

#### Success Metric
- Week 4: 70%+ of testers logged at least 1 event
- Week 8: 50%+ active week-over-week (return rate)
- Week 9: 4.0+/5 satisfaction rating

---

### 3️⃣ Risk: Security Vulnerability (RLS Bypass, Data Leak)

**Probability**: Low (1-5% if properly tested)
**Impact**: User data leaked → Legal liability, destroyed trust
**Severity**: 🔴 **HIGH** — Existential risk

#### Why This Happens
- RLS policy configured incorrectly
- Bug in Supabase (unlikely but possible)
- Client-side auth bypass (not checking token)
- Sharing user_id in logs (PII leak)

#### Mitigation Strategy

**1. RLS Configuration Validation (CRITICAL)**
- After creating RLS policies, test them:
  ```
  -- Sign in as User A (user_id = abc123)
  -- Query: SELECT * FROM mow_events WHERE user_id = xyz789
  -- Result: Should return ZERO rows (blocked)
  -- Repeat with User B, confirm they can't see User A's data
  ```
- Do this BEFORE Phase 2 starts
- If ANY data leaks → Roll back, fix, re-test

**2. Code Review**
- Never send user_id client-side; let Supabase provide it
  ```typescript
  // ❌ WRONG:
  const user_id = "abc123"; // Could be spoofed
  const { data } = await supabase
    .from("mow_events")
    .select("*")
    .eq("user_id", user_id);

  // ✅ RIGHT:
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("mow_events")
    .select("*")
    .eq("user_id", user.id); // Always use auth.getUser()
  ```

**3. Avoid Logging User Data**
- Never log full events, user IDs, or personal info
- Log only: action taken, timestamp, error code
- Use error tracking service that strips PII (Sentry with regex rules)

**4. Test Auth Edge Cases**
- Login with wrong password → Rejected ✓
- Token expiration → Auto refresh ✓
- Logout + immediate request → Rejected ✓
- Delete account → All data gone ✓

**5. Privacy Policy & Terms**
- Write before launch (legal boilerplate)
- State: "Data stored on Supabase," "We never sell data"
- Include data deletion process
- Required for App Store / Play Store

#### Success Metric
- Zero security findings in BETA testing
- RLS policies tested manually with 2+ test accounts
- Privacy policy live before public launch

---

### 4️⃣ Risk: App Store / Play Store Rejection

**Probability**: Low (5-10% for well-built apps)
**Impact**: Can't launch → May deadline becomes June
**Severity**: 🔴 **HIGH** — Hard deadline (stores take time)

#### Why This Happens
- **iOS**: Violates App Store Review Guidelines (cryptic, often fixable)
- **Android**: Rare, but can reject for permissions abuse or unsafe API usage
- **Both**: Uses forbidden APIs, misleading marketing, privacy violations

#### Mitigation Strategy

**1. Follow Platform Guidelines (Start Week 1)**
- Apple App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policies: https://play.google.com/about/developer-content-policy/
- Read them. Seriously. Saves 2-week delays.

**Common rejections (prevent these):**
- ❌ Over-permission requests ("We need calendar access for... something")
  - ✅ Only request: Location (for city), Notifications, Camera (future)
- ❌ Misleading marketing (claiming AI if not using AI)
  - ✅ Say: "Smart recommendations" (accurate)
- ❌ Broken functionality ("Payment broken, will fix in v1.1")
  - ✅ Don't ship broken features; defer them
- ❌ Unclear privacy ("We collect data, figure out the rest")
  - ✅ Clear, specific privacy policy

**2. Pre-Submission Checklist (Week 9)**
```
iOS Checklist:
- [ ] App has name, icon, screenshot
- [ ] Privacy policy URL set
- [ ] App rating set (4+)
- [ ] Contact email provided
- [ ] No hardcoded secrets (API keys, tokens)
- [ ] Tested on iPhone 14+ simulator
- [ ] Tested on iPad simulator
- [ ] Crashes fixed
- [ ] No beta features advertised

Android Checklist:
- [ ] App icon matches Google Play requirements
- [ ] Privacy policy set
- [ ] Permissions justified (Location only for city)
- [ ] No hardcoded secrets
- [ ] Tested on physical device
- [ ] Crashes fixed
```

**3. Submission Timeline**
- **Week 8**: Build final .ipa (iOS) and .apk (Android)
- **Week 9**: Submit to TestFlight + Google Play Internal Testing
  - TestFlight: Instant (internal), 1-2 days (external beta)
  - Google Play: 24-48 hours
- **Week 10**: If rejected, fix and resubmit (turnaround: 24 hours)

**4. If Rejected**
- Read rejection reason carefully (Apple gives reasons)
- Fix issue (usually simple)
- Resubmit (usually approved in 2nd round)
- Don't ship with rejection in place

#### Success Metric
- Both apps accepted to beta tracks by April 28
- May 1: Ready to invite beta testers

---

## MEDIUM PRIORITY RISKS

### Risk: Database Migration Issues

**Probability**: Medium (schema changes are error-prone)
**Impact**: Data loss or corruption
**Severity**: 🟠 **MEDIUM-HIGH**

#### Mitigation
- Test migration on staging (use Supabase cloning feature)
- Backup before migration
- Roll-back plan documented
- All data valid before going live

---

### Risk: Notification Spam / Disengagement

**Probability**: Medium (timing is hard to get right)
**Impact**: Users turn off notifications or delete app
**Severity**: 🟠 **MEDIUM**

#### Mitigation
- Start conservative: 1 notification/day max
- User control: Toggle on/off per type
- Smart scheduling: Only if action needed
- Monitor early: Check BETA feedback on notification frequency

---

### Risk: Solo Developer Burnout

**Probability**: Medium (10-week sprint is exhausting)
**Impact**: Code quality drops, timeline slips, health suffers
**Severity**: 🟠 **MEDIUM-HIGH**

#### Mitigation
- **Pace**: 20 hrs/week, not 40+ (sustainable)
- **Week off**: If schedule slips, take a break (Phase 4 is buffer)
- **Accountability**: Share timeline with a friend, check in weekly
- **Exit plan**: If burnout imminent, cut scope (defer to v1.0.1)

---

## LOW PRIORITY RISKS

### Risk: Supabase Free Tier Limits

**Probability**: Low (50k MAU is massive)
**Impact**: Paid upgrade needed
**Severity**: 🟡 **LOW** (costs ~$25/mo)

**Mitigation**: Monitor usage, upgrade if needed (Pro tier = $25/mo)

---

### Risk: Weather API Downtime

**Probability**: Low (wttr.in is reliable)
**Impact**: Users can't see weather recommendations
**Severity**: 🟡 **LOW** (graceful degradation)

**Mitigation**:
- Add fallback API (Open-Meteo, free)
- Show cached weather if API down
- Error message: "Can't fetch weather, using last update"

---

### Risk: Competing App Launches

**Probability**: Low (niche market)
**Impact**: Market becomes crowded
**Severity**: 🟡 **LOW** (early mover advantage valuable)

**Mitigation**: Execute fast, build community, differentiate on UX

---

## Risk Monitoring & Response

### Weekly Risk Check-In (Every Friday)

| Risk | Status | Trend | Action |
|------|--------|-------|--------|
| Timeline | ✅ On track | ➡️ | Keep pace |
| Engagement | ⚠️ Caution | ⬇️ | Recruit more testers |
| Security | ✅ Locked | ➡️ | No action |
| Notifications | ⚠️ Caution | ⬆️ | Adjust frequency |
| Burnout | ✅ Good | ➡️ | Maintain schedule |

### Escalation Rules

**If any risk becomes High probability + High impact:**
1. Stop and assess (1 hour)
2. Define concrete mitigation (1 hour)
3. Execute mitigation (adjust timeline/scope)
4. Re-assess next Friday

**Example escalation:**
- Friday: "We're 15 hours behind schedule"
- Action: Cut 1 non-critical feature immediately
- Replan: Push Phase 4 by 1 week if needed
- Monitor: Check velocity again next Friday

---

## Summary

The largest risks are **timeline pressure**, **tester engagement**, and **app store rejection**. Mitigate these three, and the other risks are manageable.

**Key success factors:**
1. ✅ Lock scope NOW (no additions)
2. ✅ Select engaged beta testers (not casuals)
3. ✅ Follow store guidelines religiously
4. ✅ Test security (RLS) before shipping
5. ✅ Maintain sustainable pace (burnout kills projects)

With discipline, May 1 BETA is very achievable.
