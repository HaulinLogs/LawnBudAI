# LawnBudAI BETA Plan

## BETA Feasibility Assessment

### Timeline Reality Check
- **Available time**: ~10 weeks (Feb 16 → May 1, 2026)
- **Your capacity**: Solo developer, ~20 hrs/week = ~200 hours
- **Estimated work**: ~170 hours (per implementation-plan.md)
- **Buffer**: 30 hours (15% contingency)

### Verdict: ✅ YES, BETA by May is Feasible

**But only with:**
1. **Aggressive scope cutting** — ship MVP, not full feature set
2. **Disciplined execution** — stick to timeline, no scope creep
3. **Weekly milestones** — review progress every Friday
4. **Clear defer list** — features cut now go to v1.1+

---

## BETA Scope: What's In, What's Out

### Included in BETA ✅

| Feature | Rationale | Hours |
|---------|-----------|-------|
| User Authentication | Required for multi-user | 12 |
| User Settings (city, lawn) | Enables personalization | 5 |
| Mowing Screen | Core feature, highest value | 15 |
| Watering Screen | Core feature | 15 |
| Fertilizer Screen | Core feature | 15 |
| Event History Lists | Users need to see past data | 10 |
| Home Dashboard | Shows real todos (not mocks) | 8 |
| Rule-Based Recommendations | Smart reminders without AI | 10 |
| Push Notifications | Core engagement tool | 10 |
| Onboarding Wizard | First-run experience | 8 |
| Error Handling & Loading States | Quality bar | 10 |
| App Store / Play Store Submission | BETA distribution | 5 |
| **Total** | | **143 hours** |

### Deferred to v1.1+ ❌

| Feature | Why Defer | Estimated Hours (if included) |
|---------|-----------|------|
| Soil sample tracking | Complex UI, low priority | 15 |
| Lawn photo documentation | Storage costs, edge feature | 20 |
| AI-powered recommendations | Not needed for BETA | 15 |
| Community features | Social features delay shipping | 30 |
| Complex analytics | Can add post-launch | 20 |
| Email notifications | Push is sufficient | 8 |
| Data export/backup | Can add in v1.0.1 | 10 |
| Advanced settings | Basic settings sufficient | 5 |
| Offline mode | Complex, defer | 15 |
| **Total Deferred** | ~50 hrs saved | **138 hours** |

### Cut to Simplify ⚠️

| Feature | Change | Reason |
|---------|--------|--------|
| Complex recommendations | Rule-based only (no ML) | No need for BETA complexity |
| Photo uploads | Don't include in BETA | Storage/moderation later |
| Multiple lawn properties | Limit to 1 for BETA | Simplifies UI, most have 1 lawn |
| Seasonal features | Skip for initial BETA | Can add in May/Jun after feedback |
| Voice logging | Text/form input only | Voice requires extra testing |
| Integration with smart sprinklers | Skip for BETA | Niche feature, not MVP |

---

## BETA Release Timeline (10 Weeks)

```
Week 1-2 (Feb 16 - Mar 1)     |████| Foundation
├─ Supabase setup & auth
├─ User settings screen
└─ Wire todos to real DB

Week 3-5 (Mar 2 - Mar 22)      |████████| Core Screens
├─ Mowing screen (form + history)
├─ Watering screen (form + history)
└─ Fertilizer screen (form + history)

Week 6-7 (Mar 23 - Apr 5)      |████| Recommendations & Notifications
├─ Recommendation engine
├─ Push notification setup
└─ Notification preferences

Week 8-10 (Apr 6 - Apr 30)     |████| Polish & Distribution
├─ Error handling & loading states
├─ Onboarding flow
├─ TestFlight submission (iOS)
├─ Google Play Internal (Android)
└─ Buffer for unexpected issues

May 1 (2026)                   |🎯| BETA Launch
└─ Invite 10-20 beta testers
```

---

## BETA Tester Recruitment

### Strategy: Quality Over Quantity
- **Target**: 10-20 testers (not hundreds)
- **Rationale**: Small group = faster feedback, manageable comms
- **Goal**: Find users who will actually use it, not vanity numbers

### Recruitment Channels

#### Tier 1: Personal Network (5-7 testers)
- Friends with lawns (incentive: free Premium for 1 year)
- Family members
- Coworkers with houses
- Neighbors

**Why**: They know you, will give honest feedback, low coordination overhead

#### Tier 2: Online Communities (5-7 testers)
1. **Reddit**
   - r/landscaping ("Looking for lawn care app beta testers")
   - r/gardening ("Beta test: AI lawn scheduling app")
   - Regional subreddits (e.g., r/Madison, r/Wisconsin)
   - Post: "I built an app to help homeowners manage lawn care. Looking for 10 beta testers. Free premium for 1 year."

2. **Facebook Groups**
   - Search "lawn care," "gardening," "[your city] lawn"
   - Join groups, build credibility, then post about BETA
   - Example: "Madison Lawn Care Enthusiasts" groups

3. **Nextdoor App**
   - Post in local neighborhood
   - "I'm a local developer building a lawn care app. Seeking BETA testers."

#### Tier 3: Lawn Care Forums (Organic)
- Lawn Care Forum (lawncareforum.com)
- Intro post: "Launching a free lawn care app BETA, seeking testers"
- Be genuine, not spammy

### Tester Screening

**Ideal tester profile:**
- Owns a home with a lawn
- Actually cares about lawn maintenance (not just interested)
- Uses smartphone regularly
- Willing to give feedback (3-5 minutes per week)
- Can tolerate bugs and incomplete features

**Red flags:**
- "I'll definitely use it... maybe" (unlikely to follow through)
- "I don't really care about my lawn" (wrong user)
- Requests for features outside MVP
- Extremely technical (will nitpick, delay feedback)

---

## BETA Testing Process

### Week 1: Invite & Onboard
- Send 10 invites via TestFlight (iOS) and Google Play Internal (Android)
- Request feedback on: ease of signup, form experience, notification timing
- 1-on-1 onboarding call (15 min) for first 3 testers

### Weeks 2-4: Feedback Loop
- **Weekly check-in form** (Google Form, 2 minutes):
  - What did you do this week? (log or skip using app)
  - Bugs or issues?
  - Feature requests?
  - Overall satisfaction (1-5)

- **Slack/Discord channel** for beta testers:
  - Ask specific questions (e.g., "Is notification timing good?")
  - Post updates ("Fixed issue X")
  - Community support (testers help each other)

### Weeks 5-8: Iteration
- **Prioritize feedback by impact:**
  - Bugs: Fix immediately
  - UX issues: Fix if >50% of testers report
  - Feature requests: Add to v1.1 roadmap

- **Update app weekly via EAS Update** (no App Store approval needed)

### Week 9: Final Polish
- Bug sweep: Fix all known issues
- Performance check: Ensure <2 second load times
- Device testing: Test on 2+ iOS and 2+ Android devices
- Scenario testing:
  - Sign up from scratch
  - Complete onboarding
  - Log all 3 event types
  - Receive notifications

### Week 10: Launch Readiness
- Prepare press release / launch post
- Create social media announcements
- Recruit beta testers for 2nd wave (50-100 users)

---

## Feedback Collection

### Tools
- **Google Form** (weekly check-in) — free, simple
- **Slack/Discord** — real-time communication
- **In-app feedback button** — quick issue reporting
- **Sentry** (error tracking) — catch crashes automatically

### What to Ask
```
Weekly Survey (2 min):
1. Did you use the app this week? Yes / No
2. What did you do? (select: log mowing, watering, fertilizer, none)
3. Any bugs? (open text)
4. One thing you loved? (open text)
5. One thing to improve? (open text)
6. Satisfaction: 1-5 (1=hate, 5=love)
```

### What to Track
| Metric | Goal | How to Measure |
|--------|------|----------------|
| **Usage** | >70% weekly DAU | Google Analytics in app |
| **Logging** | >50% log event/week | Form submissions |
| **Satisfaction** | >4.0/5 average | Weekly form rating |
| **Bugs** | <5 reported per week | GitHub issues or form |
| **Retention** | >60% return after week 1 | Active users over time |

---

## Success Criteria: BETA → Public Launch

### Go / No-Go Decision (End of BETA, May 1)

#### Must Have (Blocking) ✅
- [x] App doesn't crash (< 1% crash rate)
- [x] Users can sign up and log in
- [x] Users can log all 3 event types
- [x] Notifications send correctly
- [x] Data syncs across devices
- [x] iOS TestFlight + Android Internal Testing live
- [x] 10+ beta testers reporting satisfaction > 3.5/5

#### Should Have (Nice to Have)
- [ ] Average satisfaction > 4.0/5
- [ ] >70% weekly active rate among testers
- [ ] <3 reported bugs remaining
- [ ] App icon and branding complete

#### Won't Do (Explicitly Deferred)
- [ ] Community features
- [ ] Photo/soil tracking
- [ ] Complex analytics

### Decision Framework
- **All blocking criteria met** → Launch to public (iOS + Android) in early Aug
- **Missing 1 blocking criterion** → 2-week extension, fix + re-test
- **Missing 2+ blocking criteria** → Delay to Aug (scope cut further)

---

## BETA Risks & Mitigations

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Low tester engagement | Medium | Select testers who actively garden/mow |
| Bugs in auth / data loss | Medium | Rigorous testing of login flow + backups |
| Notification bugs (spam) | Medium | Start with 1 notification/day, ramp slowly |
| Timeline slippage | Medium | Kill scope ruthlessly, use buffer in week 9-10 |
| App Store rejection | Low | Follow HIG, test on real device |
| No feedback from testers | Low | Pick vocal, tech-savvy people |

---

## Public Launch Readiness

### If BETA Goes Well (May 1)
- **Target**: App Store + Play Store launch by Aug 1
- **Timeline**: 3 months for public launch prep (marketing, polish, submission)
- **Goal**: 500-1,000 downloads in first month

### If BETA Needs Work (May 15+)
- **Delay**: 2-4 weeks, fix issues, iterate
- **New launch target**: Late Aug / early Sep
- **Adjust goals**: More modest first-month targets

---

## Post-BETA Roadmap (v1.0+)

### v1.0 Public Launch (Aug 2026)
- ✅ All BETA features + bug fixes
- ✅ In-app purchases enabled (Premium tier)
- ✅ Marketing site live
- ✅ Press outreach

### v1.1 (Oct 2026)
- 🔄 AI-powered recommendations (if demand exists)
- 🔄 Photo documentation (if users request)
- 🔄 More data export options
- 🔄 Seasonal features (fall prep, spring cleanup)

### v2.0 (Q2 2027)
- 🔄 Multi-lawn support (multiple properties)
- 🔄 B2B professional tier
- 🔄 Community forum / tip sharing
- 🔄 Soil sample integration

---

## Summary

LawnBudAI BETA is **feasible by May** with the right scope. Success depends on:

1. **Discipline**: Cut scope, stick to timeline
2. **Focus**: Nail core 3 screens + notifications, skip everything else
3. **Testing**: Real users testing with real lawns
4. **Feedback loops**: Weekly iteration based on tester input

The 10-week timeline is **tight but achievable**. By May 1, you'll have a working, tested app ready to scale to public launch by August.
