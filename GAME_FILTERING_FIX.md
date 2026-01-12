# Fix: Games/Props Showing After Start Time

## Problem
Games and props that have already started are still appearing in the betting interface as if they can be bet on. This is confusing for users because:
- The game shows odds, matched volume, and "new offer" buttons
- But the game is actually hidden and can't be bet on (it's "all live")
- Users see "No Bets Right Now" in the orderbook, which contradicts the visible betting options

## Root Cause
The filtering logic that checks whether a game has started is either:
1. Not being applied when displaying games/props
2. Not correctly parsing the start time format (e.g., "7:00PM", "7:25PM")
3. Missing entirely from the display logic

## Solution
Use the utility functions in `game-filter-utility.js` to filter out games/props that have already started.

### Key Functions

**`hasGameStarted(startTime, currentTime)`**
- Checks if a game/prop has already started
- Handles multiple time formats: ISO strings, Date objects, and "7:00PM" format
- Returns `true` if the game has started, `false` otherwise

**`filterActiveGames(items, startTimeField, currentTime)`**
- Filters an array of games/props to only include those that haven't started
- Use this when fetching/displaying lists of games

**`canBetOnGame(game, startTimeField, currentTime)`**
- Checks if a single game/prop can be bet on
- Returns `false` if the game has started

### Implementation Steps

1. **Import the utility functions** into your game/prop display components
2. **Apply filtering before rendering** - filter games/props using `filterActiveGames()` or check each with `canBetOnGame()`
3. **Handle time format parsing** - the utility handles "7:00PM" format automatically
4. **Consider timezone handling** - ensure start times are in the correct timezone (the utility uses local time by default)

### Example Integration

```javascript
// When fetching games for display
const allGames = await fetchGames();
const bettableGames = filterActiveGames(allGames, 'startTime');

// Or when checking individual game
if (canBetOnGame(game, 'startTime')) {
  // Show betting interface
} else {
  // Hide game or show as "Live - No Bets Available"
}
```

## Testing Checklist

- [ ] Games with start times in the past are hidden from betting view
- [ ] Games with start times in the future are shown normally
- [ ] Props with start times in the past are hidden
- [ ] Time format "7:00PM" is parsed correctly
- [ ] ISO date strings work correctly
- [ ] Games that start "today" but time has passed are hidden
- [ ] Orderbook view doesn't show "new offer" buttons for started games
- [ ] Matched volume display is hidden for started games

## Additional Considerations

- **Live games**: If you want to show live games but mark them differently, you could modify `canBetOnGame()` to return a status (e.g., 'upcoming', 'live', 'finished') instead of just boolean
- **Timezone handling**: Make sure game start times are stored/retrieved in the correct timezone
- **Performance**: If filtering large lists, consider doing it on the backend instead of frontend
