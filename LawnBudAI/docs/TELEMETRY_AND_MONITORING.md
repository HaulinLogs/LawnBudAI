# Telemetry & Operations Monitoring Guide

This guide explains how LawnBudAI tracks usage, performance, and security **without collecting any PII (Personally Identifiable Information)**.

## What We Track (and Don't)

### ✅ What We DO Track
- **Usage**: How many users, which features used, when
- **Performance**: API latency, page load times, operations timing
- **Authentication**: Login attempts, signups, logouts (no passwords/emails)
- **Security**: Suspicious patterns, brute force attempts, unusual access
- **Errors**: Types of errors, frequency, performance impact

### ❌ What We DON'T Track
- Email addresses
- User names
- Passwords
- Phone numbers
- IP addresses
- Geolocation (opt-in only)
- Device identifiers

**All data is anonymized using only the User UUID**

---

## Setup Instructions

### Step 1: Create Telemetry Tables in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create a **new query**
3. Copy and paste the contents of `database/telemetry-schema.sql`
4. Click **Run**

This creates:
- `telemetry_events` table (usage, performance, errors)
- `security_events` table (auth failures, suspicious patterns)
- 5 pre-built views for dashboards

### Step 2: Enable Telemetry in Your App

The telemetry system is ready to use. Here's how it's integrated:

```typescript
import { trackTelemetry, trackPageView, trackFeatureUsage } from '@/lib/telemetry';

// On screen view
useEffect(() => {
  trackPageView('home-screen');
}, []);

// On feature use
const handleSavePreferences = async () => {
  trackFeatureUsage('save-preferences', {
    city_changed: true,
    fields_modified: 3,
  });
  // ... save logic
};
```

### Step 3: Monitor Security Events

The security monitoring system automatically detects:

```typescript
import { recordFailedLogin, recordSuccessfulLogin } from '@/lib/securityMonitoring';

// Track login attempts
const handleLogin = async (email, password) => {
  try {
    await signIn(email, password);
    recordSuccessfulLogin(email); // Resets brute force counter
  } catch (error) {
    await recordFailedLogin(email, error.message); // Flags if 3+ in 5min
  }
};
```

---

## Viewing Insights

### Dashboard Queries

Run these in Supabase **SQL Editor** to see operational insights:

#### Daily Active Users
```sql
SELECT * FROM daily_active_users LIMIT 30;
```

#### Feature Usage
```sql
SELECT
  event_name,
  usage_count,
  unique_users,
  ROUND(avg_latency_ms, 0) as latency_ms,
  date
FROM feature_usage_stats
ORDER BY date DESC, usage_count DESC
LIMIT 50;
```

#### Authentication Security
```sql
SELECT * FROM auth_security_summary ORDER BY date DESC LIMIT 30;
```

#### Security Events
```sql
SELECT
  date,
  severity,
  event_count,
  reasons
FROM security_events_summary
ORDER BY date DESC
LIMIT 30;
```

#### High-Risk Events (Critical)
```sql
SELECT
  user_id,
  severity,
  reason,
  metadata,
  created_at
FROM security_events
WHERE severity = 'high'
ORDER BY created_at DESC
LIMIT 20;
```

#### API Performance Percentiles
```sql
SELECT
  event_name,
  p50_ms,
  p95_ms,
  p99_ms,
  max_ms,
  sample_count
FROM performance_percentiles
ORDER BY p95_ms DESC;
```

---

## Exporting Data for Analysis

### Export to CSV
```sql
COPY (
  SELECT * FROM feature_usage_stats
  WHERE date >= NOW() - INTERVAL '30 days'
)
TO STDOUT WITH (FORMAT CSV, HEADER);
```

### Export to JSON
Use Supabase API:
```bash
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
  "https://YOUR_PROJECT.supabase.co/rest/v1/telemetry_events?select=*&order_by=created_at.desc&limit=1000" \
  > telemetry_export.json
```

---

## Integration: Error Tracking Service (Optional)

For even more detailed error tracking, integrate with:

### Option 1: Sentry (Recommended)
```bash
npm install @sentry/react-native
```

Update `lib/errorTracking.ts`:
```typescript
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
});

export function trackError(errorContext: ErrorContext) {
  Sentry.captureException(new Error(errorContext.message), {
    tags: { errorType: errorContext.errorType },
    contexts: { app: errorContext.context },
  });
}
```

### Option 2: LogRocket
```bash
npm install logrocket
```

### Option 3: Custom Webhook
Create a webhook endpoint that receives alerts:
```typescript
if (errorContext.severity === 'critical') {
  await fetch(process.env.EXPO_PUBLIC_ERROR_WEBHOOK!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      error: errorContext.message,
      severity: errorContext.severity,
    }),
  });
}
```

---

## Real-Time Alerts (Optional)

### Email Alerts on Critical Events
Set up Supabase webhooks:

1. **Dashboard** → **Database** → **Webhooks**
2. **Create webhook** on `security_events` table
3. **Trigger**: INSERT (when new security event)
4. **Endpoint**: Your backend endpoint
5. **Send payload**:
```json
{
  "severity": "{{ record.severity }}",
  "reason": "{{ record.reason }}",
  "created_at": "{{ record.created_at }}"
}
```

Your endpoint can then:
- Send Slack notification
- Send email alert
- Trigger automated response (block user, require CAPTCHA, etc.)

---

## Privacy Best Practices

✅ **We Do This Right**
- No email/name collection in telemetry
- Anonymous aggregation by default
- User can delete their own data
- RLS policies restrict access

✅ **Consider Adding**
- Privacy policy mentioning analytics
- User preference to opt-out of telemetry
- Data retention policy (delete events > 90 days old)

❌ **Never Do This**
- Don't store plaintext passwords
- Don't track API request bodies
- Don't log full error stack traces with user data
- Don't share data with 3rd parties without consent

---

## Next Steps

1. **Run the SQL schema** in Supabase
2. **Test the app** and generate some events
3. **Check the views** to see data flowing
4. **Set up alerting** for critical events (optional)
5. **Build a dashboard** to visualize key metrics (Metabase, Looker, etc.)

---

## Troubleshooting

**No telemetry data showing up?**
- Check that users are authenticated (telemetry requires a user_id)
- Check browser console for errors: `console.logs` will show what's being tracked
- Verify RLS policies allow inserts: `INSERT INTO telemetry_events (event_type, event_name, user_id) VALUES ('test', 'test', 'your-uuid')`

**Getting RLS permission denied?**
- The app user must be authenticated to insert telemetry
- Check that the table policy allows inserts from the anon role

**Performance queries are slow?**
- Use indexes (they're included in the schema)
- Add WHERE clauses to filter by date range
- Consider archiving old data to a separate table

---

For questions or to enhance the monitoring system, check the telemetry code at:
- `lib/telemetry.ts` - Tracking functions
- `lib/securityMonitoring.ts` - Security detection
- `database/telemetry-schema.sql` - Database schema
