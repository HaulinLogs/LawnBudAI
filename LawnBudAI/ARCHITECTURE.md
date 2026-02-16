# LawnBudAI Architecture

Comprehensive guide to the LawnBudAI application architecture, data flow, and system design.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    User's Device (Mobile/Web)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Expo App (React Native)                         │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • Home Screen (Weather + Todo status)                   │   │
│  │  • Mowing Screen (Record, view, delete mowing events)    │   │
│  │  • Watering Screen (Record, view watering events)        │   │
│  │  • Fertilizer Screen (Record fertilizer applications)    │   │
│  │  • Settings Screen (User preferences, account)           │   │
│  └────────────┬─────────────────────────────────────────────┘   │
│               │                                                    │
│               ├─→ Local State (React Hooks)                       │
│               ├─→ Form validation & UI logic                      │
│               └─→ Error handling & loading states                 │
│                                                                   │
└────────────┬──────────────────────────────────────────┬──────────┘
             │                                          │
             │ HTTP/REST APIs                          │ Realtime
             │ (Authentication + CRUD)                 │ (Subscriptions)
             │                                          │
┌────────────▼──────────────────────────────────────────▼──────────┐
│               Supabase (Backend as a Service)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Authentication (Supabase Auth)                                  │
│  ├─ Email/Password login                                         │
│  ├─ Session management                                           │
│  └─ User ID extraction from JWT token                            │
│                                                                   │
│  PostgreSQL Database                                             │
│  ├─ users (email, role, preferences)                             │
│  ├─ mow_events (date, height, notes, user_id)                   │
│  ├─ water_events (date, amount, source, notes, user_id)         │
│  ├─ fertilizer_events (date, type, amount, notes, user_id)      │
│  └─ Row Level Security (RLS) policies (user data isolation)      │
│                                                                   │
│  Realtime (Websocket subscriptions)                              │
│  └─ Event notifications & live updates                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

     ┌──────────────────────────────────────────┐
     │     External APIs                        │
     ├──────────────────────────────────────────┤
     │ • wttr.in Weather API (current conditions)│
     │ • Geographic location services           │
     └──────────────────────────────────────────┘
```

## Layered Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Presentation Layer                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Screens: Home, Mowing, Watering, Fertilizer, Settings   │   │
│  │ Components: Reusable UI (Cards, Forms, Stats)           │   │
│  │ Navigation: Expo Router (file-based tab routing)        │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Hooks: useMowEvents, useWaterEvents, useFertilizerEvents│   │
│  │ • Data fetching & caching                              │   │
│  │ • CRUD operations                                       │   │
│  │ • Statistics calculations                               │   │
│  │ • Error handling & loading states                       │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    Data Access Layer                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Supabase Client: @supabase/supabase-js                  │   │
│  │ • Authentication (supabase.auth)                        │   │
│  │ • Database queries (supabase.from().select())           │   │
│  │ • Realtime subscriptions                                │   │
│  │ • Error handling                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    Backend (Supabase)                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database + Auth + Realtime                   │   │
│  │ • RLS Policies enforce user data isolation              │   │
│  │ • Triggers for audit logging                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App Layout (_layout.tsx)
├─ Tab Navigation (_layout.tsx in app/(tabs)/)
│  ├─ Home Tab
│  │  ├─ WeatherCard
│  │  └─ TodoStatusCard(s)
│  ├─ Mowing Tab
│  │  ├─ MowingScreen
│  │  ├─ Form (date, height, notes)
│  │  ├─ Statistics (days since, avg height)
│  │  └─ EventHistory
│  ├─ Watering Tab
│  │  ├─ WateringScreen
│  │  ├─ Form (date, amount, source picker)
│  │  ├─ Statistics (days since, monthly total, avg)
│  │  ├─ SourceBreakdown
│  │  └─ EventHistory
│  └─ Fertilizer Tab
│     ├─ FertilizerScreen (Phase 3.3)
│     ├─ Form (date, type, amount, notes)
│     ├─ Statistics
│     └─ EventHistory
└─ Settings Screen (Future)
   ├─ User Info
   ├─ Preferences
   └─ Account Management
```

## Data Flow Diagram

### Event Recording Flow

```
User Input (Form)
    ↓
Form Validation (React)
    ↓ (if valid)
Create WaterEventInput object
    ↓
Call addEvent(input) via useWaterEvents hook
    ↓
Supabase: Insert to water_events table
    ↓ (includes user_id from auth)
RLS Policy checks: user_id matches current user
    ↓ (if valid)
Row inserted in database
    ↓
Return new event with ID
    ↓
Add to local React state
    ↓
Display success alert
    ↓
Clear form inputs
    ↓
Refresh event history display
```

### Event Fetching Flow

```
Component Mount (useEffect)
    ↓
Call fetchEvents() via useWaterEvents hook
    ↓
Supabase: SELECT * FROM water_events
    ↓
RLS Policy filters: WHERE user_id = current_user_id
    ↓
Return only current user's events
    ↓
Order by date DESC, limit 100
    ↓
Store in React state
    ↓
Render EventHistory with events
```

### Statistics Calculation Flow

```
getStats() function called
    ↓
events array from Supabase
    ↓
Calculate:
├─ daysAgo = (today - lastEvent.date) / milliseconds per day
├─ thisMonth = filter events in current calendar month
├─ totalGallons = sum amount_gallons for month
└─ average = sum all amounts / total events
    ↓
Return stats object (no DB query needed - all client-side)
    ↓
Render Statistics component
```

## Database Schema

### users table
```typescript
id: string          // UUID (Supabase Auth user)
email: string       // Unique email
created_at: timestamp
updated_at: timestamp
// Custom fields (added via postgres functions)
role: 'free' | 'premium' | 'admin'
plan_expires: timestamp (optional)
```

### mow_events table
```typescript
id: string          // UUID (primary key)
user_id: string     // FK → users.id
date: date          // Event date (YYYY-MM-DD)
height_inches: float // Grass height in inches
notes: string       // Optional notes
created_at: timestamp
updated_at: timestamp
```

**RLS Policy:**
```sql
SELECT: user_id = auth.uid()
INSERT: user_id = auth.uid()
UPDATE: user_id = auth.uid()
DELETE: user_id = auth.uid()
```

### water_events table
```typescript
id: string          // UUID (primary key)
user_id: string     // FK → users.id
date: date          // Event date
amount_gallons: float // Amount of water
source: 'sprinkler' | 'manual' | 'rain'
notes: string       // Optional notes
created_at: timestamp
updated_at: timestamp
```

### fertilizer_events table
```typescript
id: string          // UUID (primary key)
user_id: string     // FK → users.id
date: date          // Application date
type: 'nitrogen' | 'phosphorus' | 'potassium' | 'balanced'
amount_lbs: float   // Amount applied
notes: string       // Optional notes
created_at: timestamp
updated_at: timestamp
```

## Key Patterns

### Custom React Hooks Pattern

All data operations encapsulated in custom hooks:

```typescript
// Example: useMowEvents.ts
export function useMowEvents() {
  const [events, setEvents] = useState<MowEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // CRUD operations
  const addEvent = async (input: MowEventInput) => { /* ... */ };
  const deleteEvent = async (id: string) => { /* ... */ };
  const fetchEvents = async () => { /* ... */ };

  // Business logic
  const getStats = () => { /* calculations */ };

  return { events, loading, error, addEvent, deleteEvent, getStats };
}
```

**Benefits:**
- Encapsulation of data logic
- Reusable across components
- Easy to test in isolation
- Automatic error handling

### Form Submission Pattern

Standardized across all screens:

```typescript
const handleSubmit = async () => {
  // 1. Validate
  if (!date || !amount) {
    Alert.alert('Error', 'Please fill required fields');
    return;
  }

  // 2. Parse & validate types
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    Alert.alert('Error', 'Invalid amount');
    return;
  }

  // 3. Show loading
  setSubmitting(true);

  try {
    // 4. Create input object
    const input: WaterEventInput = {
      date,
      amount_gallons: amountNum,
      source,
      notes: notes.trim() || undefined,
    };

    // 5. Call hook method
    await addEvent(input);

    // 6. Show success
    Alert.alert('Success', 'Event recorded!');

    // 7. Reset form
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
  } catch (err) {
    Alert.alert('Error', 'Failed to record event');
  } finally {
    setSubmitting(false);
  }
};
```

**Advantages:**
- Consistent error handling
- Loading states prevent double-clicks
- User feedback (alerts)
- Form reset after success

### TypeScript Interfaces for Type Safety

```typescript
// Core models
export interface WaterEvent {
  id: string;
  user_id: string;
  date: string;
  amount_gallons: number;
  source: 'sprinkler' | 'manual' | 'rain';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Form input (without server-generated fields)
export interface WaterEventInput {
  date: string;
  amount_gallons: number;
  source: 'sprinkler' | 'manual' | 'rain';
  notes?: string;
}
```

**Benefits:**
- Compile-time type checking
- IDE autocompletion
- Self-documenting code
- Prevents runtime errors

## Security Architecture

### Authentication Flow

```
1. User enters email + password
   ↓
2. Send to Supabase Auth
   ↓
3. Supabase verifies credentials
   ↓
4. Return JWT token + user session
   ↓
5. Store session in app memory
   ↓
6. Include session in all Supabase requests
   ↓
7. Supabase extracts user_id from JWT
   ↓
8. All queries filtered by user_id
```

### Row Level Security (RLS)

Every table has RLS policies that enforce user isolation:

```sql
-- Example: water_events RLS policy
ALTER TABLE water_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation ON water_events
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY user_isolation_insert ON water_events
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

**Result:** Users can ONLY access their own events, enforced at database level

### Data Validation

**Client-side:** React form validation (UX)
**Server-side:** Supabase + RLS (security)

```
User Input
   ↓
Client validates format, range, required fields
   ↓ (if valid)
Supabase receives request
   ↓
JWT verified → extract user_id
   ↓
RLS policies check: user_id = auth.uid()
   ↓
Type constraints: amount_gallons > 0, source in enum, etc.
   ↓
Database constraints enforced
```

## Performance Considerations

### Caching Strategy

Events cached in React state:
- Initial fetch on component mount
- Kept in memory while screen visible
- Re-fetch when returning to screen
- Local optimistic updates (add event locally before DB confirms)

### Query Optimization

- **Limit 100**: Only fetch last 100 events (most recent)
- **Order by date DESC**: Database sorts, not client-side
- **Select specific columns**: Only fetch needed fields
- **Index on user_id**: Database indexes for fast RLS filtering

```sql
-- Index for fast user_id filtering (automatically created by Supabase)
CREATE INDEX mow_events_user_id_idx ON mow_events(user_id);
```

### Bundle Size Optimization

- Code splitting via Expo Router (only load active screens)
- Tree-shaking unused code (ESLint checks)
- Image optimization (use vector icons, not PNGs)
- Lazy loading components when needed

## Error Handling Strategy

### Try-Catch Pattern

```typescript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  return data;
} catch (err) {
  // Log to error tracking (future: sentry, etc.)
  console.error('Operation failed:', err);

  // Show user-friendly message
  const message = err instanceof Error ? err.message : 'Unknown error';
  setError(message);

  // Re-throw if needed
  throw err;
}
```

### User Feedback

- **Success**: Green alert with checkmark icon
- **Error**: Red alert with error details
- **Loading**: Spinner overlay with "Processing..."
- **Empty**: Informative empty state with icon

## Testing Architecture

### Test Pyramid

```
         /\
        /  \         E2E Tests (20+ tests)
       /    \        - User flows
      /______\       - Full integration

       /  \          Component Tests
      /    \         - UI interactions
     /______\        - Form submission

     /    \          Unit Tests (36 tests)
    /      \         - Hooks logic
   /________\        - Utilities
                     - Type checking
```

### Test Coverage Goals

- **Phase 0-2**: 50% coverage (foundation)
- **Phase 3.0-3.2**: 70% coverage (core features)
- **Phase 3.3+**: 80% coverage (production ready)

## Deployment Architecture

### Environment Progression

```
Development (Local)
   ↓ (git push feature branch)
GitHub PR with Preview URL
   ↓ (team review)
GitHub PR Merged
   ↓ (push to main)
GitHub Actions
   ├─ Quality Gates (lint, test, coverage)
   └─ Build Expo web export
   ↓ (if success)
Cloudflare Pages
   ↓
Production (lawnbudai.pages.dev)
```

### CI/CD Pipeline

1. **Pre-commit hook**: Auto-fix linting
2. **Pre-push hook**: Quality gates
3. **GitHub Actions**: Full validation
4. **Cloudflare**: Auto-deployment

## Technology Decisions

### Why Expo + React Native?

- Cross-platform (iOS, Android, Web) from single codebase
- Fast development with hot reload
- Supabase integration straightforward
- Good TypeScript support

### Why Supabase?

- PostgreSQL (reliable, scalable)
- Built-in Auth (email/password, OAuth ready)
- Row Level Security (automatic data isolation)
- Realtime subscriptions (future notifications)
- Free tier for development

### Why TypeScript?

- Catch errors at compile time
- Better IDE support & autocomplete
- Self-documenting code
- Refactoring confidence

### Why Jest + Playwright?

- Jest: Fast unit testing, great for hooks/utilities
- Playwright: Cross-browser E2E testing, simulates real user
- Combined: Full coverage from unit to integration tests

## Future Enhancements

### Phase 4: Advanced Features

- Realtime notifications (new events)
- Weather integration alerts
- Soil testing results tracking
- Historical analytics & trends
- Mobile notifications (push)
- Offline mode (sync when online)

### Phase 5: Social Features

- Team/family lawn tracking
- Shared event history
- Comments and notes
- Recommendations engine

### Phase 6: AI Integration

- Watering schedule recommendations
- Disease detection (image upload)
- Lawn health predictions
- Seasonal maintenance alerts

## Monitoring & Analytics (Future)

- Error tracking (Sentry)
- Performance monitoring (Datadog, Cloudflare)
- User analytics (Mixpanel, Segment)
- Usage metrics (active users, retention)

---

**Document Version:** 1.0
**Last Updated:** 2026-02-16
**Architecture Status:** Stable (Phase 3.0+)
