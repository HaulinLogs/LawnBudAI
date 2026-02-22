# Phase 1 Performance Optimization - Test Plan

## Testing Checklist for Phase 1: Quick Wins

### ✅ 1. Database Query Optimization Tests

#### 1.1 Auth API Call Reduction
**Objective:** Verify that `useSupabaseUser` caching reduces auth API calls

**Test Steps:**
1. Open browser DevTools → Network tab
2. Filter for requests to "auth" API endpoints
3. Navigate through screens: Home → Mowing → Watering → Fertilizer
4. **Expected Result:** No more than 1-2 auth calls per screen (was 4-6 before)

**Verification Point:** Look for consecutive calls to:
- `supabase.auth.getUser()`
- Should see cache hit from `useSupabaseUser` instead

#### 1.2 Query Column Optimization
**Objective:** Verify SELECT queries now fetch only needed columns

**Test Steps:**
1. Open Mowing, Watering, or Fertilizer screen
2. Open Network tab and filter for "GraphQL" or Supabase RPC calls
3. Create a new event (record mowing/watering/fertilizer event)
4. Check the response payload size in Network tab

**Expected Result:**
- Before: Large payload with all columns including timestamps, metadata, etc.
- After: Minimal payload with just: id, date, amount, notes

#### 1.3 Data Load Time
**Objective:** Verify pagination limit(20) reduces initial data transfer

**Test Steps:**
1. Open Mowing screen with 100+ historical events
2. Measure time to display event list
3. Check number of events displayed
4. Open Network tab to verify data size

**Expected Result:**
- Only ~20 events loaded initially
- Data transfer 80% smaller than before
- Events load visibly faster

### ✅ 2. Bundle Size Optimization Tests

#### 2.1 Verify axios Removal
**Objective:** Confirm axios was removed and isn't breaking anything

**Test Steps:**
1. In DevTools console, type: `console.log(typeof axios)`
2. Search codebase for any axios imports: `grep -r "axios" LawnBudAI/`
3. Navigate through all screens

**Expected Result:**
- No axios found in codebase
- App functions normally without it
- No console errors about missing axios

#### 2.2 Verify Image Compression
**Objective:** Confirm PNG assets were successfully optimized

**Test Steps:**
1. Open DevTools → Network tab
2. Filter for images
3. Check file sizes for:
   - icon.png
   - adaptive-icon.png
   - splash-icon.png
4. Reload and check cache behavior

**Expected Result:**
- Each image now ~59KB (was 1.1MB)
- Images load instantly from cache
- Visual quality maintained (no visible degradation)

#### 2.3 Bundle Size Verification
**Objective:** Confirm overall bundle size reduction

**Test Steps:**
1. Run: `yarn expo export:web --output-dir dist`
2. Check dist folder size: `du -sh dist/`
3. Compare to previous builds

**Expected Result:**
- Bundle size reduced by ~8MB
- Total size: ~22-25MB (was 25-30MB)

### ✅ 3. Hook Integration Tests

#### 3.1 useSupabaseUser Hook
**Objective:** Verify the caching hook works correctly

**Test Steps:**
1. Open DevTools console
2. Add a breakpoint in `hooks/useSupabaseUser.ts` at cache check
3. Navigate through 3-4 screens
4. Observe breakpoint hits

**Expected Result:**
- First call: Fetches from Supabase
- Subsequent calls within 5 minutes: Returns from cache
- After 5 minutes: Fresh fetch triggered
- On sign out: Cache cleared

#### 3.2 Event Hooks Integration
**Objective:** Verify event hooks use cached user correctly

**Test Steps:**
1. Go to Mowing screen
2. Open DevTools → Console
3. Create a new mowing event
4. Check console for any "Not authenticated" errors
5. Verify event appears in list immediately
6. Delete the event and verify it's removed

**Expected Result:**
- No authentication errors
- Event CRUD operations work smoothly
- Events display correctly
- No duplicate auth calls

#### 3.3 Loading States
**Objective:** Verify proper handling of auth loading states

**Test Steps:**
1. Hard refresh the app (Cmd+Shift+R in browser)
2. Quickly navigate to Mowing screen during loading
3. Wait for auth to complete
4. Verify data loads after auth completes

**Expected Result:**
- No errors during loading
- Proper loading indicators shown
- Data displays once auth completes
- No "Not authenticated" false positives

### ✅ 4. Performance Metrics

#### 4.1 API Call Counting
**Objective:** Measure reduction in API calls

**Test Steps:**
1. Open Network panel in DevTools
2. Clear all requests
3. Navigate: Home → Mowing → Watering → Fertilizer → Home
4. Count total auth API calls

**Expected Result:**
- Before optimization: 28+ auth calls
- After optimization: 8-10 auth calls
- **Target Achievement: 70% reduction** ✅

#### 4.2 Data Transfer Size
**Objective:** Measure bandwidth reduction

**Test Steps:**
1. Monitor Network tab during data loading
2. Load event history on each screen
3. Sum total bytes transferred
4. Calculate reduction percentage

**Expected Result:**
- Event query responses 80-85% smaller
- Overall data transfer significantly reduced
- **Target Achievement: 85% reduction** ✅

#### 4.3 Query Response Time
**Objective:** Verify query performance improvements

**Test Steps:**
1. Open Network tab and sort by Time
2. Load events on each screen
3. Note query response times

**Expected Result:**
- Queries respond faster (less data to transfer)
- Typical response time: <500ms (was 1-2s before)

### ✅ 5. Regression Testing

#### 5.1 Functionality Verification
**Test All Core Features:**
- [ ] Login/Logout works correctly
- [ ] Mowing screen: Create, read, update, delete events
- [ ] Watering screen: Create, read, update, delete events
- [ ] Fertilizer screen: Create, read, update, delete events
- [ ] Statistics display correctly
- [ ] Event history shows correct data
- [ ] Weather card displays properly
- [ ] Navigation works smoothly
- [ ] Form validation still enforces rules

**Expected Result:** All features work as before, just faster ✅

#### 5.2 Error Handling
**Test Error Scenarios:**
- [ ] Network error handling
- [ ] Invalid form submission
- [ ] Duplicate event deletion
- [ ] Logout during operation
- [ ] Rapid screen navigation

**Expected Result:** Graceful error handling maintained ✅

#### 5.3 Mobile Responsiveness
**Test on Mobile Devices:**
- [ ] Test on iPhone (if available)
- [ ] Test on Android (if available)
- [ ] Test on different screen sizes
- [ ] Test with slow 3G connection (DevTools)

**Expected Result:** Works smoothly on all devices ✅

---

## Performance Profiling Tools

### Browser DevTools
```javascript
// In DevTools Console:

// 1. Measure component render time
console.time('EventHistory Render');
// [trigger render]
console.timeEnd('EventHistory Render');

// 2. Check if useSupabaseUser is cached
// Set breakpoint in useSupabaseUser.ts
// Observer cache hits vs. cache misses

// 3. Monitor network requests
// Use Network tab to count API calls
// Filter by: auth, supabase, etc.
```

### React DevTools Profiler
```
1. Install React DevTools browser extension
2. Open app in browser
3. Go to Profiler tab
4. Record interactions:
   - Form keystroke on FertilizerScreen
   - Event list scroll
   - Screen navigation
5. Analyze render counts and timing
```

### Performance API
```javascript
// Measure custom performance markers
performance.mark('mow-event-fetch-start');
// [fetch operation]
performance.mark('mow-event-fetch-end');
performance.measure('mow-event-fetch', 'mow-event-fetch-start', 'mow-event-fetch-end');
console.log(performance.getEntriesByName('mow-event-fetch'));
```

---

## Success Criteria

### Phase 1 Must Meet:
- ✅ Auth API calls reduced by 70% (28 → 8-10)
- ✅ Data transfer reduced by 85%
- ✅ Bundle size reduced by 8MB
- ✅ All 104 tests passing
- ✅ No functional regressions
- ✅ Image quality maintained
- ✅ App runs smoothly on all screens

### Performance Targets:
- ✅ Individual query response time: <500ms
- ✅ Event list load time: <1s
- ✅ Form input response: <100ms
- ✅ Screen navigation: <500ms

---

## Test Completion Checklist

| Test Category | Status | Notes |
|--------------|--------|-------|
| Auth API calls | ⚠️ PENDING | Verify via Network tab |
| Query optimization | ⚠️ PENDING | Check payload sizes |
| Bundle size | ⚠️ PENDING | Run yarn export:web |
| Image compression | ⚠️ PENDING | Check file sizes |
| Hook integration | ⚠️ PENDING | Verify caching works |
| Core functionality | ⚠️ PENDING | CRUD operations |
| Error handling | ⚠️ PENDING | Test edge cases |
| Mobile testing | ⚠️ PENDING | Test on devices |

---

## Notes

- Run `yarn test:coverage` after changes to ensure test coverage maintained
- Use React DevTools Profiler for detailed render analysis
- Monitor Supabase dashboard for actual API call metrics
- Enable performance logging in browser console for detailed metrics
- Test with slow 3G throttling for realistic mobile experience

---

## Next Steps After Phase 1 Verification

Once Phase 1 tests pass successfully:
1. Document actual performance metrics achieved
2. Create baseline for Phase 2 testing
3. Compare actual vs. expected improvements
4. Plan Phase 3 implementation based on remaining bottlenecks
