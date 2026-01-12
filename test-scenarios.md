# Test Scenarios

## Quick Test: EV Calculator

### Test Case 1: Basic EV Calculation
1. Enter bankroll: `10000`
2. Sharp Book Lines:
   - Favorite: `-110`
   - Underdog: `+110`
3. Click "Calculate Implied Probabilities"
   - Should show: Favorite ~52.38%, Underdog ~47.62%
4. Select betting side: `Favorite`
5. Recreational Book Line: `-105`
6. Click "Calculate EV"
   - Expected EV: Positive (around 1.5-2%)
   - Should show optimal wager based on Kelly

### Test Case 2: Negative EV
1. Same setup as above
2. Recreational Book Line: `-115` (worse than sharp)
   - Expected EV: Should be negative
   - Optimal wager should be $0 or very small

### Test Case 3: Favorite Rounding (wager rounds to $50)
1. Bankroll: `50000`
2. Sharp lines: `-150` favorite, `+130` dog
3. Bet: Favorite at `-145` (good line)
4. Check: Winning amount should round to nearest $50
   - Wager may adjust accordingly

### Test Case 4: Dog Rounding (wager rounds to $50)
1. Bankroll: `50000`
2. Sharp lines: `-120` favorite, `+110` dog
3. Bet: Underdog at `+115` (good line)
4. Check: Wager amount should round to nearest $50

## Quick Test: Wong Teaser

### Test Case 1: 2-Leg Teaser
1. Bankroll: `10000`
2. Number of legs: `2`
3. Teaser odds: `-110`
4. Push handling: `void`
5. Leg 1:
   - Home/Away: `Home`
   - Line: `8.5` (after teaser)
   - Odds: `-110`
6. Leg 2:
   - Home/Away: `Away`
   - Line: `-1.5` (after teaser)
   - Odds: `-110`
7. Click "Calculate Teaser EV"
   - Should show combined probability and EV

### Test Case 2: Negative Line
1. Same setup but Leg 2 line: `-8.5`
   - Should handle negative values correctly
