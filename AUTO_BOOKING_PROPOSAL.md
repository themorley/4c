# Auto-Booking at Market Close - Design Proposal

## Overview

Allow users to set an "auto-fill at close" option when placing offers in the order book. If their order doesn't fill (or only partially fills) before market close, automatically match remaining quantity against orders on the opposite side that meet their maximum acceptable line.

## Recommended Approach: Randomized Tranche Processing

**Simple and Fair Solution:**
1. Break all auto-fill orders into $1,000 tranches (or smaller if needed)
2. At market close, randomize the order of all tranches
3. Process each tranche in the randomized sequence
4. For each tranche, match with the **best available** opposite-side order (auto-fill or non-auto-fill)
5. Continue until no more matches are possible

**Why This Works:**
- **Fair:** No advantage to placing orders earlier - each tranche gets equal chance
- **Granular:** Large orders don't dominate - broken into smaller pieces
- **Simple:** Easy to understand and implement
- **Prevents Gaming:** Can't manipulate the system by timing
- **Best Prices:** Each tranche gets matched with best available at time of processing
- **Flexible Matching:** Auto-fill tranches can match with any compatible order (auto-fill or not)

## Key Principle: Price Improvement First

**CRITICAL:** When a user sets "autofill up to -105", this means:
- **-105 is the WORST acceptable price** (the floor)
- The system will match at the **BEST available price** first
- If orders exist at -104, -103, -102, etc., match with those first
- Only match at -105 if nothing better is available

**Example:**
- User offers +108, sets max at -105
- Available opposite orders: -102, -104, -105
- **Result:** Matches at **-102** (best available), not -105

## User Experience

### UI Component
When placing an offer, add a checkbox and input field:
```
☑ Autofill at close if unbooked up to ____
[Input field for max line, e.g., -105]
```

**Example:**
- User offers: **+108** (hoping to get this line)
- Max acceptable line: **-105** (worst case - willing to accept anything from +108 down to -105)
- If order doesn't fill, auto-match with the **BEST available** opposite-side orders
- Will match at -104, -103, -102, etc. if available, only falling back to -105 if nothing better exists

## Core Matching Logic

### 1. Order Structure
Each order needs to store:
```javascript
{
  orderId: "uuid",
  userId: "user123",
  side: "Florida Panthers", // or "Buffalo Sabres"
  offeredLine: 108.9, // The line they're offering
  quantity: 100.00, // Risk amount
  filledQuantity: 0, // How much has been filled
  remainingQuantity: 100.00,
  autoFillEnabled: true,
  maxAutoFillLine: -105, // Maximum line they'll accept at close
  createdAt: timestamp,
  expiresAt: marketCloseTime
}
```

### 2. Matching Rules at Close

When market closes, for each unfilled order with `autoFillEnabled: true`:

1. **Find eligible opposite-side orders:**
   - Must be on opposite side
   - Must have `autoFillEnabled: true`
   - Must have `maxAutoFillLine` that creates a valid match
   - Must have remaining quantity > 0

2. **Determine if lines are compatible:**
   - For order offering +108 with max -105, it can match with:
     - Orders offering -105 or **BETTER** (e.g., -104, -103, -102, -101)
     - Orders offering -105 with max +108 or better (e.g., +109, +110)

3. **Match at BEST available price (Price Improvement):**
   - Always match at the **best available price** first
   - If Order A offers +108 (max -105) and Order B offers -104 (max +108)
   - They match at **-104** (better than -105)
   - Only match at -105 if no better prices are available
   - This ensures users get the best possible fill, not just an acceptable one

## Conflict Resolution Strategy: Randomized Order Processing

### Simple and Fair Approach (RECOMMENDED)

**How it works:**
1. At market close, collect all unfilled orders with `autoFillEnabled: true`
2. **Break each order into $1,000 tranches** (or smaller if order is less than $1,000)
3. **Randomize the order** of all tranches (fair, no advantage to early placement)
4. Process each tranche in the randomized sequence:
   - Find all compatible opposite-side orders from **ENTIRE order book** (auto-fill and non-auto-fill)
   - Sort compatible orders by **BEST PRICE FIRST** (price improvement)
   - Match with the best available price
   - Continue matching at next best price until tranche is filled or no compatible orders remain
5. Move to next tranche in randomized sequence
6. Continue until no more matches are possible or all tranches are processed

**Why Random Order?**
- **Fair:** No advantage to placing orders earlier
- **Simple:** Easy to understand and implement
- **Unpredictable:** Prevents gaming the system
- **Equal opportunity:** Everyone has same chance of getting best prices

### Algorithm

```javascript
// Step 1: Break orders into tranches
function createTranches(orders) {
  const tranches = [];
  const MAX_TRANCHE_SIZE = 1000;
  
  for (const order of orders) {
    if (!order.autoFillEnabled || order.remainingQuantity <= 0) continue;
    
    let remaining = order.remainingQuantity;
    let trancheIndex = 0;
    
    while (remaining > 0) {
      const trancheSize = Math.min(remaining, MAX_TRANCHE_SIZE);
      
      tranches.push({
        trancheId: `${order.orderId}-${trancheIndex}`,
        originalOrderId: order.orderId,
        userId: order.userId,
        side: order.side,
        offeredLine: order.offeredLine,
        maxAutoFillLine: order.maxAutoFillLine,
        quantity: trancheSize,
        remainingQuantity: trancheSize,
        originalOrder: order // Reference to original order for updates
      });
      
      remaining -= trancheSize;
      trancheIndex++;
    }
  }
  
  return tranches;
}

// Step 2: Main matching function
function matchAtClose(allOrders) {
  // Filter to unfilled orders with auto-fill enabled
  const autoFillOrders = allOrders.filter(o => 
    o.autoFillEnabled && 
    o.remainingQuantity > 0 && 
    o.status !== 'filled'
  );
  
  // Break auto-fill orders into $1,000 tranches
  const tranches = createTranches(autoFillOrders);
  
  // RANDOMIZE all tranches (fair processing)
  const randomizedTranches = shuffleArray([...tranches]);
  
  // Get ALL orders (auto-fill and non-auto-fill) for matching
  const allAvailableOrders = allOrders.filter(o => 
    o.remainingQuantity > 0 && 
    o.status !== 'filled'
  );
  
  const matches = [];
  
  // Process each tranche in randomized sequence
  for (const tranche of randomizedTranches) {
    if (tranche.remainingQuantity <= 0) continue;
    
    // Find compatible opposite-side orders from ENTIRE order book
    const compatible = findCompatibleOrders(tranche, allAvailableOrders);
    
    if (compatible.length === 0) continue;
    
    // Sort compatible by BEST PRICE FIRST (price improvement)
    compatible.sort((a, b) => {
      return comparePricesForBestMatch(tranche.side, a.offeredLine, b.offeredLine);
    });
    
    // Match with best available prices
    for (const matchOrder of compatible) {
      if (tranche.remainingQuantity <= 0) break;
      if (matchOrder.remainingQuantity <= 0) continue;
      
      // Check if they're compatible (zero-sum for opposite sides)
      if (!areOrdersCompatible(tranche, matchOrder)) continue;
      
      const matchQuantity = Math.min(
        tranche.remainingQuantity,
        matchOrder.remainingQuantity
      );
      
      // For opposite sides, calculate match price based on overlap
      const matchPrice = calculateMatchPriceForOppositeSides(tranche, matchOrder);
      
      // Create match
      matches.push({
        trancheId: tranche.trancheId,
        originalOrderId: tranche.originalOrderId,
        matchOrderId: matchOrder.orderId,
        quantity: matchQuantity,
        price: matchPrice,
        matchedAt: new Date()
      });
      
      // Update quantities
      tranche.remainingQuantity -= matchQuantity;
      matchOrder.remainingQuantity -= matchQuantity;
      
      // Update original order quantity
      tranche.originalOrder.remainingQuantity -= matchQuantity;
      if (tranche.originalOrder.remainingQuantity <= 0) {
        tranche.originalOrder.status = 'filled';
      }
      
      // Update match order
      if (matchOrder.remainingQuantity <= 0) {
        matchOrder.status = 'filled';
      }
      
      if (tranche.remainingQuantity <= 0) {
        break;
      }
    }
  }
  
  return matches;
}

function shuffleArray(array) {
  // Fisher-Yates shuffle for true randomization
  // This ensures each tranche has equal probability of being processed first
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Note: For deterministic testing, you could use a seeded random number generator
// But in production, true randomization ensures fairness
```

## Alternative Conflict Resolution Strategies (For Reference)

### Strategy 1: Best-Price-First with Time Priority (OLD APPROACH)

**How it works:**
1. Sort all eligible orders by creation time (first-come-first-served priority)
2. For each order, find all compatible opposite-side orders
3. **Sort compatible orders by BEST PRICE FIRST** (price improvement)
4. Match with best available price, using time priority when multiple orders want same price
5. Continue matching at next best price until order is filled or no compatible orders remain

**Example Scenario:**
- **Auto-fill orders:**
  - John: Offers +108, max -105, $100 (1 tranche: $100)
  - Bob: Offers +102, max -105, $2,000 (2 tranches: $1,000 each)
  - Joe: Offers +108, max -105, $5,000 (5 tranches: $1,000 each)
  - **Total: 8 tranches**

- **Non-auto-fill orders in book:**
  - Order X: Offers -102, max +108, $500
  - Order Y: Offers -104, max +108, $1,500
  - Order Z: Offers -105, max +108, $2,000

**Matching Process (Randomized Tranches):**
1. **Break into tranches:** 8 tranches total
2. **Randomize tranches:** [Joe-1, Bob-1, Joe-2, John-1, Bob-2, Joe-3, Joe-4, Joe-5]
   (Example randomization - actual order is random each time)

3. **Process Joe-1 first** (randomly selected):
   - Finds compatible orders: Order X at -102 (BEST), Order Y at -104, Order Z at -105
   - Matches with Order X at **-102** (best available)
   - Joe-1: $500 matches with Order X: $500 → Order X fully filled, Joe-1: $500 remaining
   - Joe-1: $500 remaining matches with Order Y at **-104** (next best)
   - Joe-1: $500 matches with Order Y: $500 → Joe-1 fully filled, Order Y: $1,000 remaining

4. **Process Bob-1 next:**
   - Finds compatible orders: Order Y at -104 (BEST remaining), Order Z at -105
   - Matches with Order Y at **-104**
   - Bob-1: $1,000 matches with Order Y: $1,000 → Order Y fully filled, Bob-1 fully filled

5. **Process Joe-2, John-1, Bob-2, etc.** in sequence:
   - Each matches with best available at time of processing
   - Can match with remaining auto-fill tranches or non-auto-fill orders

6. **John-1 (spot 4) can match with:**
   - Remaining Joe tranches (if on opposite sides)
   - Remaining Bob tranches (if on opposite sides)
   - Non-auto-fill Order Z (if compatible)

**Result:** All tranches filled at best available prices, with randomized order determining processing sequence. Auto-fill tranches can match with each other or non-auto-fill orders.

**Pros:**
- **Fair:** No advantage to placing orders earlier
- **Simple:** Easy to understand and implement
- **Unpredictable:** Prevents gaming the system
- **Equal opportunity:** Everyone has same chance of getting best prices

**Cons:**
- Less predictable (but that's the point - it's fair)
- Users can't game by placing orders early

### Strategy 2: Midpoint Matching with Quantity Priority

**How it works:**
1. Group orders by their desired match line (e.g., all wanting -105)
2. For each group, match at the midpoint of compatible lines
3. Larger orders get matched first (quantity priority)

**Example:**
- Order A: Offers +108, max -105
- Order B: Offers +102, max -105
- Order C: Offers -105, max +108
- Order D: Offers -105, max +102

**Matching:**
- All want to match at -105
- Match at -105 (the common point)
- Sort by quantity, match largest first

**Pros:**
- Simple to understand
- Fair for large orders
- Consistent pricing

**Cons:**
- Doesn't reward early placement
- May disadvantage smaller orders

### Strategy 3: Best-Price-First with Round-Robin

**How it works:**
1. Sort orders by how "good" their max line is (better for the matcher)
2. Match best prices first
3. Rotate through orders of equal priority

**Example:**
- Order A: Offers +108, max -105 (willing to accept -105)
- Order B: Offers +102, max -105 (willing to accept -105)
- Order C: Offers -105, max +108 (willing to accept +108)
- Order D: Offers -105, max +102 (willing to accept +102)

**Matching:**
- Order C (max +108) is better for +108 side than Order D (max +102)
- Match Order A with Order C first (both want +108/-105)
- Then match Order B with Order D

**Pros:**
- Maximizes value for both sides
- Natural market efficiency

**Cons:**
- More complex
- May feel unfair if someone gets a "worse" match

## Recommended Solution: Hybrid Approach

Combine **Strategy 1 (Time Priority)** with **price improvement**:

### Algorithm (Randomized Order with Best Price Matching):
1. **Phase 1: Randomize Order Processing**
   - At market close, collect all unfilled orders with auto-fill enabled
   - **Randomize the order** of these orders (fair, no advantage to early placement)
   - This ensures fairness and prevents gaming

2. **Phase 2: Process Each Order in Randomized Sequence**
   - For each order in the randomized list:
     - Find ALL compatible opposite-side orders
     - Sort compatible orders by **BEST PRICE FIRST** (price improvement)
     - Match with the best available price
     - Continue matching at next best price until order is filled or no compatible orders remain
   - Example: +108 (max -105) finds orders at -104, -105 → matches at -104 first

3. **Phase 3: Continue Until Complete**
   - Move to next order in randomized sequence
   - Continue until no more matches are possible or all orders are processed
   - Each order gets matched with best available prices at the time it's processed

### Matching Price Determination (Always Best Available)

When two orders match, determine the price:
- **Always use the BEST available price** (the order's offered line, not their max)
- **Example 1:** +108 (max -105) matches -104 (max +108) → match at **-104** (best available)
- **Example 2:** +108 (max -105) matches -105 (max +108) → match at **-105** (only if -104 not available)
- **Example 3:** +108 (max -105) matches -102 (max +108) → match at **-102** (best available)

**Key Principle:** The "max line" is a FLOOR (worst acceptable), not the target. Always match at the best available price within the acceptable range.

## Implementation Details

### Data Structure
```javascript
// Order with auto-fill
{
  orderId: "uuid",
  userId: "user123",
  side: "Florida Panthers",
  offeredLine: 108.9,
  quantity: 100.00,
  filledQuantity: 0,
  remainingQuantity: 100.00,
  autoFillEnabled: true,
  maxAutoFillLine: -105,
  createdAt: "2024-01-12T10:00:00Z",
  expiresAt: "2024-01-12T16:00:00Z", // market close
  status: "active" // active, partially_filled, filled, cancelled
}
```

### Matching Function Pseudocode
```javascript
function matchAtClose(orders) {
  // Filter to unfilled orders with auto-fill enabled
  const eligibleOrders = orders.filter(o => 
    o.autoFillEnabled && 
    o.remainingQuantity > 0 && 
    o.status !== 'filled'
  );
  
  // RANDOMIZE the order (fair processing, no advantage to early placement)
  const randomizedOrders = shuffleArray([...eligibleOrders]);
  
  const matches = [];
  
  for (const order of eligibleOrders) {
    if (order.remainingQuantity <= 0) continue;
    
    // Find compatible opposite-side orders
    const compatible = findCompatibleOrders(order, eligibleOrders);
    
    if (compatible.length === 0) continue;
    
    // Sort compatible by BEST PRICE FIRST (price improvement)
    // For +108 side, better prices are -104 > -105 > -106 (more negative is better)
    // For -105 side, better prices are +110 > +109 > +108 (more positive is better)
    compatible.sort((a, b) => {
      return comparePricesForBestMatch(order.side, a.offeredLine, b.offeredLine);
    });
    
    // Match with best available
    for (const matchOrder of compatible) {
      if (order.remainingQuantity <= 0) break;
      if (matchOrder.remainingQuantity <= 0) continue;
      
      const matchQuantity = Math.min(
        order.remainingQuantity,
        matchOrder.remainingQuantity
      );
      
      // Match at the best available price (the opposite order's offered line)
      const matchPrice = matchOrder.offeredLine;
      
      // Create match
      matches.push({
        orderA: order.orderId,
        orderB: matchOrder.orderId,
        quantity: matchQuantity,
        price: matchPrice,
        matchedAt: new Date()
      });
      
      // Update quantities
      order.remainingQuantity -= matchQuantity;
      matchOrder.remainingQuantity -= matchQuantity;
      
      if (order.remainingQuantity <= 0) {
        order.status = 'filled';
        break;
      }
    }
  }
  
  return matches;
}

function findCompatibleOrders(tranche, allOrders) {
  return allOrders.filter(other => {
    // Can't match with itself
    if (other.orderId === tranche.originalOrderId) return false;
    
    // Must be opposite side
    if (other.side === tranche.side) return false;
    
    // Must have remaining quantity
    if (other.remainingQuantity <= 0) return false;
    
    // Check if lines are compatible
    return areLinesCompatible(tranche, other);
  });
}

function areLinesCompatible(orderA, orderB) {
  // Order A offers +108, max -105
  // Order B offers -105, max +108
  // They're compatible if:
  // - Order A's max (-105) is >= Order B's offered (-105)
  // - Order B's max (+108) is <= Order A's offered (+108)
  
  // Determine which side each order is on
  const orderASide = orderA.side;
  const orderBSide = orderB.side;
  
  // For simplicity, assume we can determine if lines cross
  // This depends on your line representation
  
  // If Order A is offering +108 (dog) and max -105 (fav)
  // And Order B is offering -105 (fav) and max +108 (dog)
  // They cross and are compatible
  
  return checkLineCompatibility(
    orderA.offeredLine,
    orderA.maxAutoFillLine,
    orderB.offeredLine,
    orderB.maxAutoFillLine
  );
}

function comparePricesForBestMatch(orderSide, priceA, priceB) {
  // For a +108 order (dog side), better prices are more negative (e.g., -104 > -105)
  // For a -105 order (fav side), better prices are more positive (e.g., +110 > +108)
  
  // Determine if order is on favorite or underdog side
  // This depends on your line representation
  // For now, assume positive = dog, negative = favorite
  
  if (orderSide === 'dog' || orderSide === 'underdog') {
    // Better prices are more negative (closer to 0 or negative)
    return priceA - priceB; // Negative means priceA is better
  } else {
    // Better prices are more positive
    return priceB - priceA; // Negative means priceA is better
  }
}

// The match price is always the opposite order's offered line (best available)
// No need for calculateMatchPrice - we use matchOrder.offeredLine directly
```

## Critical Edge Case: Different Offered Prices, Overlapping Acceptable Ranges

### Scenario: Spread Betting with Different Offers

**Example:**
- **Bob:** Offers Chiefs -3 at **+110**, willing to book up to **-110**
- **John:** Offers Bills +3 at **+115**, willing to book up to **-100**
- Both offering same dollar amount
- They're the only two orders in the market

**Understanding the Offers:**
- **Bob:** Betting on Chiefs -3 (Chiefs must win by more than 3)
  - Offering +110 odds (wants to receive +110 or better on Chiefs -3)
  - Willing to accept down to -110 (worse odds, but still acceptable)
- **John:** Betting on Bills +3 (Bills can lose by up to 3 or win)
  - Offering +115 odds (wants to receive +115 or better on Bills +3)
  - Willing to accept down to -100 (worse odds, but still acceptable)
- These are opposite sides of the same bet, so they can match

**CRITICAL: Zero-Sum Game**
- When matching opposite sides, the odds are inversely related
- If Bob gets +115 on Chiefs -3, then John gets **-115** on Bills +3
- If Bob gets +110 on Chiefs -3, then John gets **-110** on Bills +3
- The odds must balance: one side's positive = other side's negative

**The Problem:**
- Bob wants +110 or better on Chiefs -3 (down to -110 acceptable)
- John wants +115 or better on Bills +3 (down to -100 acceptable)
- But if Bob gets +115, John gets -115 (John wants +115, not -115!)
- If Bob gets +110, John gets -110 (John wants +115, not -110!)
- Their acceptable ranges need to be checked on the CORRECT side for each party

**Understanding Acceptable Ranges:**
- Bob: Wants +110 or better on Chiefs -3, accepts down to -110
  - If matched, Bob gets odds on Chiefs -3, John gets opposite odds on Bills +3
  - Bob's acceptable range: +110 to -110 on Chiefs -3
  - This means John would get: -110 to +110 on Bills +3
- John: Wants +115 or better on Bills +3, accepts down to -100
  - If matched, John gets odds on Bills +3, Bob gets opposite odds on Chiefs -3
  - John's acceptable range: +115 to -100 on Bills +3
  - This means Bob would get: -115 to +100 on Chiefs -3

**Finding the Overlap:**
- Bob accepts: +110 to -110 on Chiefs -3 (John gets -110 to +110 on Bills +3)
- John accepts: +115 to -100 on Bills +3 (Bob gets -115 to +100 on Chiefs -3)
- Overlap on Bob's side: -110 to +100 (intersection of +110 to -110 and -115 to +100)
- Overlap on John's side: -100 to +110 (intersection of -110 to +110 and +115 to -100)

### Resolution: Match at the Best Price Within Acceptable Overlap

**Solution Options:**

**Option 1: Match at +100 / -100 (Best for Bob)**
- Bob gets +100 on Chiefs -3 (within his -110 to +110 range, better than -110)
- John gets -100 on Bills +3 (within his +115 to -100 range, his worst acceptable)
- Bob gets price improvement, John gets his worst acceptable

**Option 2: Match at -110 / +110 (Best for John)**
- Bob gets -110 on Chiefs -3 (within his +110 to -110 range, his worst acceptable)
- John gets +110 on Bills +3 (within his +115 to -100 range, better than -100)
- Bob gets his worst acceptable, John gets price improvement

**Option 3: Match at Midpoint (Fair Split)**
- Midpoint of overlap: approximately +105 / -105
- Bob gets +105 on Chiefs -3 (better than -110, worse than +110)
- John gets -105 on Bills +3 (better than -100, worse than +115)
- Both get something between their offer and worst case

### Recommended: Randomized Order with Best Available (UPDATED)

**Solution:** Randomize order processing, then match at **best available price** for each order

**Algorithm:**
1. Randomize the order of all auto-fill orders at market close
2. Process each order in randomized sequence
3. For each order, find compatible opposite-side orders
4. Match at best available price within acceptable overlap
5. Continue until order is filled or no compatible orders remain

**Example:**
- Random order: [John, Bob] (John processed first)
- John matches first: Gets +110 (best available), Bob gets -110
- If Bob processed first: Bob gets +100 (best available), John gets -100
- Randomization ensures fairness - no advantage to early placement

### Implementation

```javascript
function calculateMatchPriceForOppositeSides(tranche, matchOrder) {
  // Tranche: Bob - Chiefs -3 at +110, max -110
  // MatchOrder: John - Bills +3 at +115, max -100
  // These are opposite sides, so odds are inversely related
  
  // Step 1: Determine acceptable ranges for each order on THEIR side
  const trancheRange = {
    min: tranche.maxAutoFillLine, // -110 (worst acceptable)
    max: tranche.offeredLine      // +110 (best/offered)
  };
  
  const matchOrderRange = {
    min: matchOrder.maxAutoFillLine || matchOrder.offeredLine, // -100 (worst acceptable) or offered if no auto-fill
    max: matchOrder.offeredLine       // +115 (best/offered)
  };
  
  // Step 2: Convert to same side to find overlap
  // If Order A gets X on their side, Order B gets -X on their side
  // So Order A's range on their side = -Order B's range on Order B's side
  
  // Tranche accepts: +110 to -110 on their side
  // This means MatchOrder would get: -110 to +110 on MatchOrder's side
  const matchOrderFromTranche = {
    min: -trancheRange.max, // -110 (if Tranche gets +110, MatchOrder gets -110)
    max: -trancheRange.min  // +110 (if Tranche gets -110, MatchOrder gets +110)
  };
  
  // MatchOrder accepts: +115 to -100 on their side
  // This means Tranche would get: -115 to +100 on Tranche's side
  const trancheFromMatchOrder = {
    min: -matchOrderRange.max, // -115 (if MatchOrder gets +115, Tranche gets -115)
    max: -matchOrderRange.min  // +100 (if MatchOrder gets -100, Tranche gets +100)
  };
  
  // Step 3: Find overlap on Tranche's side
  const overlapOnTranche = {
    min: Math.max(trancheRange.min, trancheFromMatchOrder.min), // max(-110, -115) = -110
    max: Math.min(trancheRange.max, trancheFromMatchOrder.max)   // min(+110, +100) = +100
  };
  
  // Step 4: Match at best price within overlap
  // Since tranches are processed in random order, give best price to the tranche being processed
  // (The tranche being processed gets priority for best price)
  return overlapOnTranche.max; // +100 (best for Tranche)
  
  // Alternative: Use midpoint for absolute fairness
  // return (overlapOnA.min + overlapOnA.max) / 2; // +105
}
```

**Result (randomized order determines who gets processed first):**
- **If Bob processed first:** Bob gets +100 on Chiefs -3, John gets -100 on Bills +3
- **If John processed first:** John gets +110 on Bills +3, Bob gets -110 on Chiefs -3
- **Randomization ensures fairness** - no advantage to placing orders earlier
- Both parties get matched within their acceptable ranges
- The order processed first gets the best available price within the overlap

**Key Insights:**
- In zero-sum matching, you can't give both parties their best price
- The system must find the overlap of acceptable ranges
- **Randomized order processing** ensures fairness - no advantage to early placement
- The order processed first gets the best available price within the overlap
- Simple, fair, and prevents gaming the system

### Alternative: If Both Want Different Price Types

**If Bob offers -110 and John offers +115:**
- Need to determine which is "better" - this depends on the bet structure
- For opposite sides of a spread, typically match at the better price for the party receiving it
- Or use a midpoint if both prices are acceptable to both parties

### Key Principle

**Always match at the best available price that's acceptable to both parties.**
- If both offer positive odds, use the higher one
- If both offer negative odds, use the one closer to 0 (less negative)
- If one offers better than the other, the party getting the better price gets price improvement

### Alternative Scenarios

**If Bob offers -110 (max -130) and John offers -115 (max -130):**
- Match at **-110** (better price for both)
- Bob gets his preferred price
- John gets better than his offered price (price improvement)

**If Bob offers -110 (max -130) and John offers -105 (max -130):**
- Match at **-105** (best available)
- Bob gets better than his offered price
- John gets his preferred price

## Edge Cases

### 1. Partial Fills Before Close
- Only auto-fill the **remaining quantity**
- Example: $100 order, $30 filled → auto-fill remaining $70

### 2. Multiple Orders from Same User
- Treat each order independently
- No special priority for same user

### 3. Market Close Timing
- Define clear "market close" time
- Run matching algorithm once at close
- Don't allow new orders after close

### 4. Insufficient Opposite-Side Liquidity
- If no compatible orders exist, order remains unfilled
- User is notified their auto-fill didn't execute

### 5. Orders with Same Max Line
- Use time priority (earlier order gets matched first)
- If quantities don't align, match proportionally

## User Notifications

After market close, notify users:
- ✅ "Your order was auto-filled at -104 (better than your max of -105)"
- ✅ "Your order was partially auto-filled: $70 of $100 at -103"
- ✅ "Your order was auto-filled at -105 (your maximum acceptable line)"
- ⚠️ "Your order could not be auto-filled - no compatible orders available"
- ⚠️ "Your order was partially auto-filled: $50 of $100 at -105 (insufficient liquidity)"

## Testing Scenarios

1. **Basic Match:** +108 (max -105) with -105 (max +108) → should match at -105 (only if no better available)
2. **Price Improvement (Primary):** +108 (max -105) with -104 (max +108) → should match at **-104** (best available)
3. **Multiple Price Levels:** +108 (max -105) with orders at -102, -104, -105 → matches at **-102** first (best)
4. **Time Priority:** Two +108 orders, one -104 order → earlier +108 gets matched at -104
5. **Proportional:** $200 order with two $100 orders at same price → each gets $100
6. **Partial Fill:** $100 order, $30 filled, $70 auto-fills at best available price
7. **No Match:** +108 (max -105) but only -110 available → no match (-110 is worse than -105)
8. **Multiple Sides:** Multiple users on both sides → match at best available prices first, then time priority

## Recommendations

1. **Price Improvement First** - Always match at best available price (primary goal)
2. **Time Priority for Conflicts** - When multiple orders want same best price, earlier orders get priority
3. **Clear communication** - Users should understand "up to -105" means best available, not guaranteed -105
4. **Allow opt-out** - Users can disable auto-fill if they prefer
5. **Show preview** - Before placing order, show what auto-fill would do at current best available prices

## Questions to Consider

1. Should auto-fill be opt-in (checkbox) or opt-out (default enabled)?
2. Should there be a minimum quantity threshold for auto-fill?
3. Should users be able to modify their max line after placing order?
4. How to handle orders that are partially filled during trading hours?
5. Should there be a "preview" of potential auto-fill matches before close?
