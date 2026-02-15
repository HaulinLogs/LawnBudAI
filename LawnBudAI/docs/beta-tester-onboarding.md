# LawnBudAI Beta Tester Onboarding Guide

## For Your Beta Testers

---

## Welcome! 🌱

You're one of the first people testing **LawnBudAI** — an app to help homeowners manage lawn care with weather-aware reminders.

**Your role**: Test the app on real devices, find bugs, and help us understand what works and what doesn't.

**What you get**: 1 year of free Premium ($24.99 value) + your name in credits (if you want)

---

## What to Expect (Phases)

### Phase A: Initial Setup (Week 1)
- You'll receive a TestFlight invite (iOS) or Google Play internal test link (Android)
- Install the app
- Sign up with your own email
- Set up your lawn preferences
- Let us know if anything breaks

### Phase B: Core Testing (Weeks 2-4)
- **Log real lawn care events** (when you actually mow, water, fertilize)
- Report any bugs or confusing UI
- Answer weekly survey (2 minutes)
- Share feedback in Slack

### Phase C: Refinement (Weeks 5-8)
- Test updated versions (we'll push fixes weekly)
- Test new features (notifications, recommendations)
- Provide detailed feedback
- Help us prioritize improvements

### Phase D: Final Polish (Weeks 9-10)
- Test complete app end-to-end
- Verify no crashes or data loss
- Provide final feedback before public launch

---

## Getting Started

### Step 1: Install the App
**iOS**: Check email for TestFlight link
- Tap link → Tap "View in App Store" → Tap "Install"
- Wait for download (~2 min)
- Launch app, allow notifications

**Android**: Check email for Google Play internal testing link
- Tap link → Tap "Install"
- Wait for download (~2 min)
- Launch app, allow notifications

### Step 2: Create Your Account
- Email: Use any email (suggest personal)
- Password: Anything secure
- City: Your actual city (for weather)
- Lawn size: Approximate (e.g., "0.5 acres" or "5,000 sqft")
- Grass type: Choose closest match (cool-season, warm-season, mixed)

### Step 3: Confirm It Works
- Home screen shows your city's weather ✓
- Can tap through all 4 tabs (Home, Mowing, Watering, Fertilizer) ✓
- Settings screen shows your preferences ✓

If anything is broken → **Report immediately** in Slack with:
- Device: iPhone 14 / Pixel 7 / etc.
- What happened: "Can't tap Mowing tab" / "Weather doesn't load"
- Screenshot: If possible

---

## How to Test

### What You're Testing (Priority Order)

#### 🥇 Critical (Test First)
1. **Sign up & Login**
   - Can you create an account?
   - Can you log out and log back in?
   - Does data persist? (Log off iPad, check iPhone — is data the same?)

2. **Logging Events**
   - Tap "Mowing" → Fill form (date, height, notes) → Save
   - Repeat for "Watering" (date, amount, source) and "Fertilizer"
   - Can you see your events in the history list?
   - Can you delete an event?

3. **Home Dashboard**
   - Does it show accurate weather for your city?
   - Do the "todos" (Mow, Water, Fertilizer) make sense?
   - Do they update when you log an event?

4. **Notifications**
   - Do you get a notification at the right time?
   - Does tapping it open the app to the right screen?
   - Can you turn notifications on/off in settings?

#### 🥈 Important (Test Second)
- Settings: Can you change your city, lawn size, grass type?
- Data sync: Log on iPhone, check if visible on iPad (if testing both)
- Error handling: What happens if you lose WiFi? Does app still work?

#### 🥉 Nice-to-Have (If Time)
- Visual design: Do colors make sense? Is text readable?
- Performance: Does app feel fast or sluggish?
- Edge cases: Try entering weird data (date in future, negative amounts)

---

## Weekly Testing Protocol

### Every Friday (2 minutes)
Fill out this form: **[Google Form Link — will send**]

```
Q1: Did you use the app this week?
Options: Yes / No

Q2: What did you do?
Options: Logged mowing / Logged watering / Logged fertilizer / Just looked at it / Didn't open

Q3: Any bugs? (describe or attach screenshot)
Text field

Q4: What did you love?
Text field (1-2 sentences)

Q5: What should we improve?
Text field (1-2 sentences)

Q6: How satisfied? (1-5)
1 = Hate it, 5 = Love it
```

**Takes 2 minutes, huge help for us.**

---

## Reporting Bugs

### How to Report (in Slack #beta-testing)

**Format:**
```
Device: iPhone 13 / Pixel 6 / etc.
App version: [shown in Settings]
What I did: "Tapped Watering tab, filled form, hit Save"
What happened: "App crashed, white screen"
Expected: "Event saved, returned to history"
Screenshot: [attached]
```

**Examples:**

❌ **Don't say**: "App is broken"
✅ **Say**: "When I try to save a watering event with amount > 100 gallons, app crashes to home screen"

❌ **Don't say**: "Performance bad"
✅ **Say**: "Home screen takes 5 seconds to load weather; Watering tab is instant"

---

## Feedback Loop

### What Happens After You Report

1. **We read it** (usually within 24 hours)
2. **We acknowledge** ("Thanks! We see the issue")
3. **We fix it** (1-7 days depending on severity)
4. **You test the fix** (update app, confirm it's resolved)
5. **We ship it** (goes into next build)

### Severity Levels

| Severity | Example | Response Time |
|----------|---------|---|
| 🔴 Critical | App crashes, data loss, can't sign up | Fix within 24 hrs |
| 🟠 High | Feature doesn't work (e.g., can't log event) | Fix within 3 days |
| 🟡 Medium | UI confusing, button in wrong place | Fix within 1 week |
| 🟢 Low | Typo, minor visual tweak | Defer to v1.1 |

---

## Slack Channel (#beta-testing)

**Your beta testers + me will be in one Slack channel** for real-time communication.

### How to Use It
- **Daily**: Share quick observations or bugs
- **Weekly**: Slack reminder for Friday survey
- **On demand**: Ask questions ("What should I test next?")
- **Updates**: I'll post new builds + what to test

### Example Slack Flow
```
[Monday 9am] Me: "v0.1.3 released! Please test notifications."
[Monday 10am] Friend 1: "Tested on Android. Got 1 notif at 8 AM. Works! ✓"
[Monday 2pm] Friend 2: "iOS testing now... found crash in settings"
[Tuesday 10am] Me: "Fixed settings crash, rolling v0.1.4"
[Tuesday 11am] Friend 2: "Retested, works now! 👍"
```

---

## Your Commitment

This is **optional** but super helpful:

- **Minimum**: Use app 1x/week, fill Friday survey (2 min)
  - This is honestly all we need

- **Nice-to-have**: Report bugs as you find them (5-15 min/week)
  - You'll find real issues by using it naturally

- **Amazing**: Test specific features we ask (1 hour/month)
  - "Can you test notifications on both iOS + Android this week?"
  - We'll specifically ask for this

**No pressure to be perfect.** Just use the app like a real user would. That's the most valuable feedback.

---

## FAQ

### Q: Will the app break my real data?
**A**: It shouldn't, but this is beta. We test heavily. If something goes wrong, we can restore from backups. Your data is safe, but treat it as "use at your own risk."

### Q: What if I find a security issue?
**A**: Don't post in public Slack. DM me directly with details. We'll fix it before public launch.

### Q: What if I stop using it mid-beta?
**A**: No problem! Just let us know. We get useful feedback from people who use it for 2 weeks and then stop.

### Q: Do I have to keep testing after public launch?
**A**: Nope. You'll have free Premium for 1 year whether you keep using it or not. Thanks for being a beta tester!

### Q: Can I tell my friends about the app?
**A**: Not yet. Please keep beta link private (it's just for you). After public launch (Aug 2026), tell everyone!

### Q: What if I have feature requests?
**A**: We'd love to hear them! But for BETA, we're testing what exists, not adding new features. Add them to a "v1.1 ideas" list for later.

---

## Thank You!

Seriously. Beta testing is the most valuable thing for a small app. You're helping us ship something great.

**Questions?** Slack me anytime.

**Ready?** Install the app and let's go! 🚀
