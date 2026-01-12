# Auto-Booking at Market Close - Implementation Specification

## Overview

Implement an auto-fill feature that automatically matches unfilled orders at market close. Users can opt-in to have their orders automatically matched with compatible opposite-side orders if they don't fill during normal trading hours.

## User Story

**As a** user placing an order  
**I want** to set an "auto-fill at close" option with a maximum acceptable line  
**So that** my order gets automatically matched at market close if it hasn't filled, ensuring I get filled at the best available price within my acceptable range

## Requirements

### UI Requirements

1. Add checkbox and input field when placing an offer:
   - Checkbox: "☑ Autofill at close if unbooked up to ____"
   - Input field: Maximum acceptable line (e.g., -105)
   - Only visible/enabled when placing new orders

2. Store in order data:
   - `autoFillEnabled: boolean`
   - `maxAutoFillLine: number` (only set if autoFillEnabled is true)

### Functional Requirements

1. **Tranche Breakdown**: Break all auto-fill orders into $1,000 tranches (or smaller if order < $1,000)
2. **Randomization**: Randomize the order of all tranches at market close
3. **Matching**: Process each tranche in randomized order, matching with best available opposite-side orders
4. **Price Improvement**: Always match at the best available price, not the maximum acceptable
5. **Zero-Sum Pricing**: For opposite sides, calculate match price based on acceptable range overlap

## Implementation Details

### Data Model Changes

```javascript
// Add to Order schema
{
  autoFillEnabled: boolean,        // User opted in for auto-fill
  maxAutoFillLine: number | null,  // Worst acceptable line (null if autoFillEnabled is false)
  // ... existing order fields
}
```

### Core Algorithm

#### Step 1: Create Tranches

```javascript
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
        originalOrder: order // Reference for updates
      });
      
      remaining -= trancheSize;
      trancheIndex++;
    }
  }
  
  return tranches;
}
```

#### Step 2: Randomize Tranches

```javascript
function shuffleArray(array) {
  // Fisher-Yates shuffle for true randomization
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

#### Step 3: Main Matching Function

```javascript
async function matchAtClose(gameId, marketCloseTime) {
  // Get all unfilled orders for this game
  const allOrders = await getUnfilledOrders(gameId);
  
  // Filter to auto-fill enabled orders
  const autoFillOrders = allOrders.filter(o => 
    o.autoFillEnabled && 
    o.remainingQuantity > 0 && 
    o.status !== 'filled'
  );
  
  if (autoFillOrders.length === 0) {
    return { matches: [], message: 'No auto-fill orders to process' };
  }
  
  // Break into tranches
  const tranches = createTranches(autoFillOrders);
  
  // Randomize tranches
  const randomizedTranches = shuffleArray([...tranches]);
  
  // Get ALL available orders (auto-fill and non-auto-fill) for matching
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
    
    // Sort by BEST PRICE FIRST (price improvement)
    compatible.sort((a, b) => {
      return comparePricesForBestMatch(tranche.side, a.offeredLine, b.offeredLine);
    });
    
    // Match with best available prices
    for (const matchOrder of compatible) {
      if (tranche.remainingQuantity <= 0) break;
      if (matchOrder.remainingQuantity <= 0) continue;
      
      // Check compatibility (zero-sum for opposite sides)
      if (!areOrdersCompatible(tranche, matchOrder)) continue;
      
      const matchQuantity = Math.min(
        tranche.remainingQuantity,
        matchOrder.remainingQuantity
      );
      
      // Calculate match price (handles zero-sum for opposite sides)
      const matchPrice = calculateMatchPriceForOppositeSides(tranche, matchOrder);
      
      // Create match record
      const match = await createMatch({
        trancheId: tranche.trancheId,
        originalOrderId: tranche.originalOrderId,
        matchOrderId: matchOrder.orderId,
        quantity: matchQuantity,
        price: matchPrice,
        matchedAt: new Date(),
        gameId: gameId
      });
      
      matches.push(match);
      
      // Update quantities
      tranche.remainingQuantity -= matchQuantity;
      matchOrder.remainingQuantity -= matchQuantity;
      
      // Update original order
      await updateOrderQuantity(tranche.originalOrderId, -matchQuantity);
      
      // Update match order
      await updateOrderQuantity(matchOrder.orderId, -matchQuantity);
      
      if (tranche.remainingQuantity <= 0) {
        break;
      }
    }
  }
  
  return { matches, processedTranches: randomizedTranches.length };
}
```

#### Step 4: Find Compatible Orders

```javascript
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
```

#### Step 5: Check Line Compatibility

```javascript
function areLinesCompatible(tranche, matchOrder) {
  // For tranche offering +108 with max -105:
  // Can match with orders offering -105 or better (e.g., -104, -103, -102)
  // Or orders offering -105 with max +108 or better
  
  // Determine if lines cross and are within acceptable ranges
  // This depends on your line representation (spread, moneyline, etc.)
  
  // Example for spread betting:
  // Tranche: +108 (offered), -105 (max)
  // MatchOrder: -104 (offered), +108 (max)
  // They're compatible if:
  // - Tranche's max (-105) >= MatchOrder's offered (-104) [tranche accepts matchOrder's price]
  // - MatchOrder's max (+108) <= Tranche's offered (+108) [matchOrder accepts tranche's price]
  
  return checkLineCompatibility(
    tranche.offeredLine,
    tranche.maxAutoFillLine,
    matchOrder.offeredLine,
    matchOrder.maxAutoFillLine || matchOrder.offeredLine
  );
}
```

#### Step 6: Calculate Match Price (Zero-Sum for Opposite Sides)

```javascript
function calculateMatchPriceForOppositeSides(tranche, matchOrder) {
  // Example: Bob offers Chiefs -3 at +110, max -110
  //          John offers Bills +3 at +115, max -100
  
  // Step 1: Determine acceptable ranges
  const trancheRange = {
    min: tranche.maxAutoFillLine, // -110 (worst acceptable)
    max: tranche.offeredLine      // +110 (best/offered)
  };
  
  const matchOrderRange = {
    min: matchOrder.maxAutoFillLine || matchOrder.offeredLine, // -100 or offered
    max: matchOrder.offeredLine       // +115 (best/offered)
  };
  
  // Step 2: Convert to same side to find overlap
  // If Tranche gets X on their side, MatchOrder gets -X on their side
  const matchOrderFromTranche = {
    min: -trancheRange.max, // -110 (if Tranche gets +110, MatchOrder gets -110)
    max: -trancheRange.min  // +110 (if Tranche gets -110, MatchOrder gets +110)
  };
  
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
  return overlapOnTranche.max; // +100 (best for Tranche)
}
```

#### Step 7: Compare Prices for Best Match

```javascript
function comparePricesForBestMatch(orderSide, priceA, priceB) {
  // For a +108 order (dog side), better prices are more negative (e.g., -104 > -105)
  // For a -105 order (fav side), better prices are more positive (e.g., +110 > +108)
  
  // Determine if order is on favorite or underdog side
  // This depends on your line representation
  
  if (orderSide === 'dog' || orderSide === 'underdog' || orderSide > 0) {
    // Better prices are more negative (closer to 0 or negative)
    return priceA - priceB; // Negative means priceA is better
  } else {
    // Better prices are more positive
    return priceB - priceA; // Negative means priceA is better
  }
}
```

## Key Principles

### Price Improvement First

**CRITICAL:** When a user sets "autofill up to -105", this means:
- **-105 is the WORST acceptable price** (the floor)
- The system will match at the **BEST available price** first
- If orders exist at -104, -103, -102, etc., match with those first
- Only match at -105 if nothing better is available

**Example:**
- User offers +108, sets max at -105
- Available opposite orders: -102, -104, -105
- **Result:** Matches at **-102** (best available), not -105

### Zero-Sum Matching

For opposite sides of the same bet (e.g., Chiefs -3 vs Bills +3):
- If one side gets +X, the other gets -X
- Must find overlap of acceptable ranges
- Match at best price within overlap

**Example:**
- Bob: Chiefs -3 at +110, max -110
- John: Bills +3 at +115, max -100
- Overlap: -110 to +100 on Bob's side
- Match at +100 / -100 (best for Bob, worst acceptable for John)

## Edge Cases

### 1. Partial Fills Before Close
- Only auto-fill the **remaining quantity**
- Example: $100 order, $30 filled → auto-fill remaining $70

### 2. Orders Smaller Than $1,000
- Create single tranche with full amount
- Example: $100 order → 1 tranche of $100

### 3. No Compatible Orders
- Tranche remains unfilled
- User is notified their auto-fill didn't execute

### 4. Multiple Tranches from Same Order
- Each tranche processed independently
- Can match with different counterparties at different prices
- Aggregate results for user display

### 5. Non-Auto-Fill Orders
- Can still be matched by auto-fill tranches
- No special handling needed - just part of available order book

### 6. Same-Side Orders
- Cannot match (must be opposite sides)
- Filtered out in `findCompatibleOrders`

## Database Changes

### New Fields on Orders Table

```sql
ALTER TABLE orders ADD COLUMN auto_fill_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN max_auto_fill_line DECIMAL(10,2) NULL;
```

### New Table: Matches

```sql
CREATE TABLE matches (
  match_id UUID PRIMARY KEY,
  tranche_id VARCHAR(255),
  original_order_id UUID REFERENCES orders(order_id),
  match_order_id UUID REFERENCES orders(order_id),
  quantity DECIMAL(10,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  matched_at TIMESTAMP NOT NULL,
  game_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### 1. Create Order with Auto-Fill

```
POST /api/orders
{
  "side": "Florida Panthers",
  "offeredLine": 108.9,
  "quantity": 100.00,
  "autoFillEnabled": true,
  "maxAutoFillLine": -105,
  ...
}
```

### 2. Trigger Auto-Fill at Market Close

```
POST /api/games/:gameId/auto-fill
{
  "marketCloseTime": "2024-01-12T16:00:00Z"
}
```

**Response:**
```json
{
  "matches": [...],
  "processedTranches": 8,
  "totalMatches": 5,
  "message": "Auto-fill completed"
}
```

### 3. Get Auto-Fill Results

```
GET /api/orders/:orderId/auto-fill-results
```

**Response:**
```json
{
  "orderId": "uuid",
  "autoFillEnabled": true,
  "matches": [
    {
      "trancheId": "order-0",
      "quantity": 1000,
      "price": -104,
      "matchedWith": "order-uuid",
      "matchedAt": "2024-01-12T16:00:00Z"
    },
    ...
  ],
  "totalFilled": 3000,
  "remaining": 0
}
```

## Testing Scenarios

### Test Case 1: Basic Tranche Matching
- **Setup:** John $100, Bob $2,000, Joe $5,000 (all auto-fill)
- **Expected:** 8 tranches created, randomized, matched with best available

### Test Case 2: Price Improvement
- **Setup:** Order offering +108, max -105
- **Available:** Orders at -102, -104, -105
- **Expected:** Matches at -102 first (best available)

### Test Case 3: Zero-Sum Matching
- **Setup:** Bob offers +110 (max -110), John offers +115 (max -100)
- **Expected:** Match at +100 / -100 (best within overlap)

### Test Case 4: Mixed Auto-Fill and Non-Auto-Fill
- **Setup:** 3 auto-fill orders, 2 non-auto-fill orders
- **Expected:** Auto-fill tranches can match with all 5 orders

### Test Case 5: Partial Fill Before Close
- **Setup:** $1,000 order, $300 filled before close
- **Expected:** Only $700 auto-fills at close

### Test Case 6: No Compatible Orders
- **Setup:** Auto-fill order, no compatible opposite-side orders
- **Expected:** Order remains unfilled, user notified

## Acceptance Criteria

- [ ] Users can enable auto-fill when placing orders
- [ ] Auto-fill orders are broken into $1,000 tranches
- [ ] Tranches are randomized at market close
- [ ] Each tranche matches with best available opposite-side order
- [ ] Auto-fill tranches can match with non-auto-fill orders
- [ ] Price improvement works (matches at best available, not max)
- [ ] Zero-sum pricing works for opposite sides
- [ ] Partial fills before close are handled correctly
- [ ] Users receive notifications about auto-fill results
- [ ] All matches are recorded in database
- [ ] Order quantities are updated correctly

## Performance Considerations

- Process auto-fill matching in background job/queue
- Batch database updates where possible
- Consider rate limiting if processing many games simultaneously
- Log all matches for audit trail

## Security Considerations

- Validate `maxAutoFillLine` is within reasonable bounds
- Ensure users can only modify their own orders
- Prevent manipulation of randomization (use secure random)
- Audit all auto-fill matches

## Notifications

After auto-fill completes, notify users:
- ✅ "Your order was auto-filled: $1,000 at -104, $1,000 at -105"
- ✅ "Your order was partially auto-filled: $700 of $1,000 at -105"
- ⚠️ "Your order could not be auto-filled - no compatible orders available"

## Future Enhancements

- Allow users to modify `maxAutoFillLine` after placing order
- Show preview of potential auto-fill matches before close
- Allow users to cancel auto-fill before market close
- Add analytics on auto-fill success rates
