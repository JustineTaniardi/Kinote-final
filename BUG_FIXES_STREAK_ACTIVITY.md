# Bug Fixes: Streak Activity Issues

## Problems Fixed

### 1. Break Time Accumulation Issue
**Problem**: Break Time berubah dari 10 menit menjadi 27 menit setelah melakukan streak activity.

**Root Cause**: Di file `src/app/api/streaks/[id]/complete-session/route.ts`, breakTime di-accumulate setiap kali session selesai:
```typescript
breakTime: streak.breakTime + totalBreakTime,  // ❌ WRONG: Accumulation
```

**Fix**: Removed accumulation logic. breakTime sekarang hanya diubah melalui manual edit di detail sidebar:
```typescript
// ❌ DO NOT UPDATE breakTime - it's user's preference for break duration, not accumulative
```

### 2. Streak Count Mismatch Issue
**Problem**: Di detail sidebar menunjukkan streakCount=1, tapi di component menunjukkan 0.

**Root Cause**: streakCount dihitung dari semua completed histories, tidak hanya verified ones.

**Fix**: Changed logic di `complete-session/route.ts` untuk menghitung streakCount hanya dari verified histories:
```typescript
// Count verified sessions from StreakHistory for streak count
const verifiedCount = await prisma.streakHistory.count({
  where: {
    streakId,
    userId,
    verifiedAI: true,  // ✅ Only count verified histories
  },
});
```

### 3. Break Count Reset Issue
**Problem**: Break Count berubah menjadi 0 setelah streak activity selesai (dari 4).

**Root Cause**: Di file `src/app/api/streaks/[id]/start/route.ts`, breakCount di-update setiap kali session dimulai.

**Fix**: Removed update breakCount logic dari start route:
```typescript
// NOTE: Do NOT update breakCount here - it should only be set during activity creation
// breakCount is a user preference for how many break sessions are allowed per activity
```

---

## Files Modified

1. **src/app/api/streaks/[id]/complete-session/route.ts**
   - Removed `breakTime: streak.breakTime + totalBreakTime` accumulation
   - Changed to count only verified histories for streakCount
   - Updated response to return `verifiedCount` instead of `completedCount`

2. **src/app/api/streaks/[id]/start/route.ts**
   - Removed breakCount update logic when starting session
   - breakCount now only changes through manual edit via detail sidebar

---

## How the Fields Work Now

### breakTime
- **Set during**: Activity creation (POST /api/streaks)
- **Modified by**: Manual edit in detail sidebar (PATCH /api/streaks/{id})
- **NOT modified during**: Session start or completion
- **Purpose**: User's preferred break duration preference

### breakCount
- **Set during**: Activity creation (POST /api/streaks)
- **Modified by**: Manual edit in detail sidebar (PATCH /api/streaks/{id})
- **NOT modified during**: Session start or completion
- **Purpose**: Number of break repetitions allowed per activity session

### streakCount
- **Calculated from**: Number of verified StreakHistory records (where verifiedAI=true)
- **Updated when**: Session is completed AND verified by AI
- **NOT updated for**: Unverified sessions
- **Purpose**: Count of successful/verified activity sessions

### totalBreakTime (in StreakHistory)
- **Set during**: Session completion
- **Value**: Sum of all completed break sessions in that single session
- **Purpose**: Analytics for individual session break times

---

## Testing

To verify the fixes:

1. **Break Time**: Create an activity with 10 min break time. Complete a session. Verify break time stays 10 min.
2. **Streak Count**: Complete a session without AI verification. Verify component shows 0, not 1.
3. **Break Count**: Create activity with 4 break repetitions. Complete a session. Verify break count stays 4.

