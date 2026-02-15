# LawnBudAI Implementation Plan

## Current Codebase State (Assessment)

### What's Built ✅
- **Weather Integration** (100%): Fully functional weather fetching from wttr.in API
- **UI Components** (100%): 12+ reusable components with dark/light theme support
- **File-based Routing** (100%): Expo Router with 4 functional tab screens
- **TypeScript**: Full type safety throughout codebase
- **App Architecture**: Responsive design for iOS, Android, and web

### What's Partial ⚠️
- **Home Screen** (80%): Shows mock todos instead of real database data
- **Mowing Screen** (40%): UI only; no data entry or history
- **Watering/Fertilizer Screens** (20%): Skeleton components
- **Database Schema** (5%): Schema defined in `database/init.ts` but NEVER integrated

### What's Missing ❌
- **Authentication**: No user login or registration
- **Database CRUD**: Zero implemented database operations
- **Data Persistence**: App doesn't save user data
- **Multi-user Support**: No user account system
- **Notifications**: No push notifications or scheduling
- **Recommendations**: No smart recommendations engine
- **Settings Screen**: No user preferences
- **Forms**: No data entry forms

---

## Technology Stack

### Frontend (Client)
```
Expo (v53.0.20) + React Native (0.79.5)
├── TypeScript (5.8.3)
├── Expo Router (5.1.4) — file-based routing
├── React (19.0.0)
├── Expo Notifications (upcoming)
└── Components: All custom-built, no third-party UI libs
```

### Backend (Server)
```
Supabase (PostgreSQL + Auth)
├── Postgres database (replaces local SQLite)
├── Built-in Auth (email/password + OAuth)
├── Row Level Security (RLS) for multi-user data isolation
└── Realtime subscriptions (optional, for future)
```

### Web / Marketing
```
Webflow or Next.js on Vercel
├── Landing page
├── App Store / Play Store links
└── Email signup for waitlist
```

### Deployment
```
Expo Application Services (EAS)
├── EAS Build: Automated iOS + Android builds
├── EAS Submit: App Store + Play Store submission
├── EAS Update: OTA updates (skip review for critical bugs)
└── Cost: Free tier (builds/month within limits)
```

---

## Architecture: Multi-User Security

### The Challenge
Your current app uses local SQLite, which only works for single users on one device. To support multiple users and devices, you need:
1. A server to store data centrally
2. User authentication
3. Data isolation (User A can't see User B's lawn data)

### Solution: Supabase + Row Level Security (RLS)

#### How It Works
```
┌─────────────────┐
│  iPhone User 1  │
│  (john@email)   │
│  mows lawn      │
│  logs in        ├─────────────────┐
└─────────────────┘                 │
                          ┌─────────▼──────────────┐
┌─────────────────┐       │  Supabase Backend      │
│ iPad User 1     │       │                        │
│ (john@email)    │       │  ┌──────────────────┐  │
│ sees same       ├──────▶│  │ mow_events table │  │
│ data (synced)   │       │  │ (RLS: user_id)   │  │
└─────────────────┘       │  └──────────────────┘  │
                          │                        │
┌─────────────────┐       │  ┌──────────────────┐  │
│ Browser User 2  │       │  │ water_events     │  │
│ (jane@email)    │       │  │ (RLS: user_id)   │  │
│ different data  ├──────▶│  │ Only sees Jane's │  │
│ (isolated)      │       │  │ data via RLS      │  │
└─────────────────┘       │  └──────────────────┘  │
                          └────────────────────────┘
```

#### Row Level Security (RLS) Policy Example
```sql
-- Enable RLS on all lawn care tables
ALTER TABLE mow_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own lawn events
CREATE POLICY "Users can only access their own data"
ON mow_events FOR ALL
USING (auth.uid() = user_id);
```

This means:
- Even if the database is compromised, user data is isolated
- User A's queries only return User A's rows
- No cross-user data leaks possible
- Enforced at database level (not application level)

---

## Database Schema (Postgres via Supabase)

### Tables (Migrated from SQLite)

```sql
-- Users (managed by Supabase Auth)
-- Automatically created by Supabase

-- User Settings
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT DEFAULT 'Madison',
  lawn_size_sqft INTEGER,
  grass_type TEXT, -- 'cool_season', 'warm_season', 'mixed'
  mowing_frequency_days INTEGER DEFAULT 7,
  mowing_height_inches DECIMAL DEFAULT 2.5,
  watering_frequency_days INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);

-- Mowing Events
CREATE TABLE mow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  height_inches DECIMAL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Watering Events
CREATE TABLE water_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_gallons DECIMAL,
  source TEXT, -- 'sprinkler', 'manual', 'rain'
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Fertilizer Events
CREATE TABLE fertilizer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT, -- 'nitrogen', 'phosphorus', 'potassium', 'balanced'
  amount_lbs DECIMAL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE mow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilizer_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (same for each table)
CREATE POLICY "Users see only their data"
ON user_preferences FOR ALL
USING (auth.uid() = user_id);

-- (Repeat for other tables...)
```

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2, ~30 hours)

**Goal**: Working authentication + synced database

#### Tasks
1. **Supabase Setup** (3 hours)
   - Create Supabase project (free)
   - Migrate schema from SQLite → Postgres
   - Enable RLS policies
   - Test connection from app

2. **Install Supabase Client** (2 hours)
   ```bash
   npx expo install @supabase/supabase-js
   npx expo install @react-native-async-storage/async-storage
   ```

3. **Create Auth Hook** (8 hours)
   - `hooks/useAuth.ts`
   - Email + password sign-up
   - Email + password login
   - Session persistence
   - Logout
   - Password reset

4. **Create Auth Screens** (12 hours)
   - `app/(auth)/sign-up.tsx`
   - `app/(auth)/sign-in.tsx`
   - `app/(auth)/forgot-password.tsx`
   - Error handling, loading states
   - Redirect to (tabs) on auth success

5. **User Profile / Settings Screen** (5 hours)
   - `app/(tabs)/settings.tsx`
   - Edit city, lawn size, grass type
   - Logout button
   - Save to `user_preferences` table

6. **Wire useTodo to Database** (5 hours)
   - Replace mock data in `hooks/useTodo.ts`
   - Fetch from `mow_events`, `water_events`, `fertilizer_events` tables
   - Calculate next mowing/watering/fertilizer due date

#### Deliverable
- Users can sign up, log in, and persist sessions
- Settings are saved and synced across devices
- Home dashboard shows real todos from database

---

### Phase 2: Core Screens (Weeks 3-5, ~50 hours)

**Goal**: All 3 care screens functional with data entry and history

#### Tasks

1. **Mowing Screen Completion** (15 hours)
   - Update `screens/MowingScreen.tsx`
   - Form: Date picker, height input (inches), notes textarea
   - Submit button: Insert into `mow_events` table
   - History list: Show last 10 mowing events with date, height, notes
   - Delete functionality: Swipe to delete
   - Statistics: "Last mowed X days ago"

2. **Watering Screen Completion** (15 hours)
   - Create `screens/WateringScreen.tsx`
   - Form: Date picker, amount (gallons), source dropdown (sprinkler/manual/rain), notes
   - Submit button: Insert into `water_events`
   - History list with metadata
   - Statistics: "Last watered X days ago"

3. **Fertilizer Screen Completion** (15 hours)
   - Create `screens/FertilizerScreen.tsx`
   - Form: Date picker, type dropdown, amount (lbs), notes
   - Submit button: Insert into `fertilizer_events`
   - History list
   - Statistics: "Last fertilized X days ago"

4. **Shared Components** (5 hours)
   - `components/EventForm.tsx` — reusable date/time picker + text inputs
   - `components/EventHistory.tsx` — reusable history list with delete
   - `components/Statistics.tsx` — reusable stats display

#### Deliverable
- Users can log mowing, watering, and fertilizing events
- All events are persisted to Supabase
- Home dashboard shows real "next due" dates based on history
- Syncs across devices in real-time

---

### Phase 3: Intelligence & Notifications (Weeks 6-7, ~30 hours)

**Goal**: Smart recommendations + push notifications

#### Tasks

1. **Recommendation Engine** (10 hours)
   - `services/recommendations.ts`
   - Rule-based logic (NO AI for BETA, too complex):
     ```
     Mowing: If last_mow > user_pref.mowing_frequency
       AND weather.rain_expected_7_day = false
       → "Time to mow"

     Watering: If days_since_rain > 3
       AND temperature > 75°F
       → "Water today"

     Fertilizer: If last_fertilizer > 45 days
       → "Consider fertilizing"
     ```
   - Call from Home screen to calculate todos

2. **Push Notifications Setup** (10 hours)
   - Install Expo Notifications
   - Create notification service
   - Schedule daily check at 8 AM
   - If recommendation triggered → send notification
   - User tap opens app to the relevant screen

3. **Notification Preferences** (10 hours)
   - Add to Settings screen
   - Toggle: Mowing reminders, Watering reminders, Fertilizer reminders
   - Time preference: When to send (8 AM, 12 PM, 6 PM)
   - Save to `user_preferences` table

#### Deliverable
- Users get smart, weather-aware reminders
- Notifications only send when action is needed
- All settings configurable

---

### Phase 4: Polish & App Store (Weeks 8-10, ~30 hours)

**Goal**: Beta-ready, submitted to App Stores

#### Tasks

1. **Error Handling & Validation** (10 hours)
   - Network error states (can't reach Supabase)
   - Validation: Date must be past, amounts must be positive
   - Timeout handling: API calls have 10-second timeout
   - Empty state UI: "No mowing events yet" screens

2. **Loading States** (5 hours)
   - Spinners while data loads
   - Disabled buttons while submitting
   - Skeleton screens for history lists

3. **Onboarding Flow** (8 hours)
   - `app/(auth)/onboarding.tsx`
   - Welcome screen (app intro)
   - Setup wizard: Grass type, lawn size, location
   - Tour of features
   - Save to database on completion

4. **Testing & QA** (5 hours)
   - Test on iOS device (iPhone)
   - Test on Android device (Pixel/Samsung)
   - Test on web (browser)
   - Edge cases: No internet, timeout, concurrent edits

5. **App Store Submission** (2 hours)
   - Create App Store Connect account + configure TestFlight
   - Create Play Store Developer account + set up internal test track
   - Submit to TestFlight + Google Play Internal Testing
   - Wait for approval (~24-48 hours)

#### Deliverable
- Production-ready app
- Submitted to TestFlight for iOS
- Submitted to Google Play Internal Testing for Android
- Ready for BETA tester invite

---

## Immediate Next Steps (This Week)

### Day 1-2: Supabase Setup
```bash
# 1. Visit https://supabase.com and create free project
# 2. Note: Project URL and Key (anon public key)
# 3. Create the schema above in Supabase SQL editor
# 4. Enable RLS on all tables
```

### Day 2-3: Install Supabase Client
```bash
cd /Users/kevin/Documents/LawnBudAI/LawnBudAI
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

### Day 3-5: Create Auth Infrastructure
1. Create `lib/supabase.ts` — Supabase client initialization
2. Create `hooks/useAuth.ts` — Auth hook (sign up, login, logout)
3. Create auth screens (sign-up, sign-in)
4. Update `app/_layout.tsx` to redirect to auth if not logged in

### Day 5-7: Test End-to-End
- Sign up with test email
- Create user settings
- Verify data appears in Supabase dashboard
- Log out and log back in
- Verify data persists

---

## Platform Support

### iOS
- **Requirements**: Mac with Xcode (free)
- **Build**: `eas build --platform ios`
- **Distribution**: TestFlight (free, internal only) → App Store (needs approval)
- **Cost**: $99/year Apple Developer account

### Android
- **Requirements**: Android SDK (free, via Android Studio)
- **Build**: `eas build --platform android`
- **Distribution**: Google Play Internal Testing (free) → Google Play Store (review ~24 hours)
- **Cost**: $25 one-time Google Play Developer account

### Web (Marketing Site)
- **Option 1**: Use Webflow or Framer (no code, $15-24/mo)
- **Option 2**: Build Next.js site (code-based, deploy on Vercel free)
- **Purpose**: Landing page with App Store/Play Store links

### Using EAS (Expo Application Services)
```bash
# Configure EAS
eas build:configure

# Build for iOS (creates .ipa)
eas build --platform ios --auto-submit

# Build for Android (creates .apk)
eas build --platform android

# OTA Update (update app without App Store review)
eas update

# Submit to App Stores (one command)
eas submit --platform ios
eas submit --platform android
```

---

## Estimated Hours Per Phase

| Phase | Activity | Hours |
|-------|----------|-------|
| 1 | Supabase + Auth + Settings | 30 |
| 2 | 3 Core Screens + Forms + History | 50 |
| 3 | Recommendations + Notifications | 30 |
| 4 | Polish + Onboarding + App Store | 30 |
| **Total** | | **140** |

**Buffer**: 60 hours for unexpected issues, debugging, design adjustments
**Grand Total**: ~200 hours (matches your 10 weeks × 20 hrs/week)

---

## Technology Decisions & Trade-Offs

### Why Supabase?
| Alternative | Why Not | Why Supabase Wins |
|-------------|---------|-------------------|
| Firebase | Complex pricing, vendor lock-in | Cheaper, Postgres standard SQL, easier auth |
| Self-hosted Postgres | 1 week to set up, ongoing ops | 5 minutes, Supabase manages it |
| Keep SQLite | Works for solo user | Can't support multi-user, syncing is hard |
| AWS RDS | Complex, expensive to manage | Overkill for BETA scale |

### Why Rule-Based Recommendations (Not AI)?
- **BETA doesn't need AI** — rule-based recommendations work great
- **AI (Claude API) adds cost** (~$1-3/mo at current scale, negligible)
- **AI adds latency** — rule-based is instant
- **Can upgrade to AI later** when metrics justify it (v1.5)

### Why No Third-Party UI Library?
- App is already using custom components (cleaner, smaller bundle)
- Expo has great built-in components
- Can add library later if needed (Redux, RN Paper, etc.)

---

## Risk Mitigation

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Supabase API changes | Low | Use official SDK, monitor docs |
| RLS policy bugs | Medium | Test thoroughly with multiple users |
| Weather API downtime | Low | Add fallback (Open-Meteo free) |
| Performance with 100k users | Low (future problem) | Can migrate to self-hosted later |
| Database migration issues | Medium | Test on staging first, roll back plan |

---

## Success Criteria

- ✅ Users can sign up and create accounts
- ✅ Users can log mowing, watering, fertilizer events
- ✅ Data syncs across devices
- ✅ Push notifications send appropriately
- ✅ App Store and Play Store submissions accepted
- ✅ 50+ beta testers onboarded
- ✅ <5% crash rate
