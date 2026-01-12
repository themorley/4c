# Alt Lines Badge - Before & After Comparison

## Visual Changes

### Before
```
┌─────────────────────────────────────┐
│ Over/Under                           │
│           45.5              -112     │
└─────────────────────────────────────┘
```

### After (WITH Alt Lines)
```
┌─────────────────────────────────────┐
│ Over/Under                           │
│           45.5              -112     │
│         ALT LINES                   │
└─────────────────────────────────────┘
```

### After (WITHOUT Alt Lines)
```
┌─────────────────────────────────────┐
│ Over/Under                           │
│           45.5              -112     │
└─────────────────────────────────────┘
```
*(Same as before - badge doesn't appear)*

---

## Code Changes

### React/JSX - Before

```jsx
<div className="market-row">
    <div className="market-label">Over/Under</div>
    <div className="spread-value">{market.total}</div>
    <div className="odds">{market.totalOdds}</div>
</div>
```

### React/JSX - After

```jsx
<div className="market-row">
    <div className="market-label">Over/Under</div>
    <div className="spread-total-container">
        <div className="spread-total-value">{market.total}</div>
        {market.altTotals && market.altTotals.length > 0 && (
            <div 
                className="alt-lines-badge"
                onClick={() => openAltLinesModal('total', market.altTotals)}
            >
                ALT LINES
            </div>
        )}
    </div>
    <div className="odds">{market.totalOdds}</div>
</div>
```

**Changes:**
1. ✅ Wrapped value in `spread-total-container`
2. ✅ Changed class from `spread-value` to `spread-total-value`
3. ✅ Added conditional badge rendering
4. ✅ Added click handler

---

### Vanilla JavaScript - Before

```javascript
function renderTotalMarket(market) {
    const valueEl = document.createElement('div');
    valueEl.className = 'spread-value';
    valueEl.textContent = market.total;
    return valueEl;
}
```

### Vanilla JavaScript - After

```javascript
import { createSpreadTotalElement } from './alt-lines-badge.js';

function renderTotalMarket(market) {
    return createSpreadTotalElement(market.total, {
        altLines: market.altTotals || [],
        onClick: () => openAltLinesModal('total', market.altTotals)
    });
}
```

**Changes:**
1. ✅ Import utility function
2. ✅ Use `createSpreadTotalElement` instead of manual DOM creation
3. ✅ Pass alt lines array
4. ✅ Pass click handler

---

## Data Structure Changes

### Before

```javascript
const market = {
    spread: -3.5,
    spreadOdds: -110,
    total: 45.5,
    totalOdds: -112
};
```

### After

```javascript
const market = {
    spread: -3.5,
    spreadOdds: -110,
    altSpreads: [  // NEW: Add this field
        { value: -3, odds: -110 },
        { value: -4, odds: -105 }
    ],
    total: 45.5,
    totalOdds: -112,
    altTotals: [  // NEW: Add this field
        { value: 44.5, odds: -110 },
        { value: 46.5, odds: -108 }
    ]
};
```

**Changes:**
1. ✅ Add `altSpreads` array (can be empty `[]`)
2. ✅ Add `altTotals` array (can be empty `[]`)

---

## HTML Structure Changes

### Before

```html
<div class="market-row">
    <div class="market-label">Spread</div>
    <div class="spread-value">-3.5</div>
    <div class="odds">-110</div>
</div>
```

### After

```html
<div class="market-row">
    <div class="market-label">Spread</div>
    <div class="spread-total-container">
        <div class="spread-total-value">-3.5</div>
        <div class="alt-lines-badge">ALT LINES</div>
    </div>
    <div class="odds">-110</div>
</div>
```

**Changes:**
1. ✅ New container: `spread-total-container`
2. ✅ Value class changed: `spread-value` → `spread-total-value`
3. ✅ New badge element: `alt-lines-badge` (only when alt lines exist)

---

## CSS Changes

### Before

```css
.spread-value {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
}
```

### After

```css
/* New container */
.spread-total-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

/* Updated value class */
.spread-total-value {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
}

/* New badge */
.alt-lines-badge {
    background: #e0e7ff;
    color: #4338ca;
    font-size: 8px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
}
```

**Changes:**
1. ✅ Add container styles
2. ✅ Update value class name
3. ✅ Add badge styles

---

## File Changes Summary

### Files to Add
- ✅ `alt-lines-badge.css` - Styles
- ✅ `alt-lines-badge.js` - Utilities (or `AltLinesBadge.tsx` for React)

### Files to Modify
- ✅ Market rendering components/functions
- ✅ Data models/types (add alt lines fields)
- ✅ API response handlers (if needed)

### Files to Include
- ✅ HTML: Add `<link>` and `<script>` tags
- ✅ React: Import components and CSS
- ✅ Build config: Ensure files are bundled

---

## Migration Path

### Phase 1: Add Infrastructure
1. Add CSS file
2. Add JavaScript file
3. Include in project

### Phase 2: Update Data
1. Add `altSpreads` field to spread markets
2. Add `altTotals` field to total markets
3. Ensure empty arrays when no alt lines

### Phase 3: Update Rendering
1. Find all spread rendering locations
2. Find all total rendering locations
3. Replace with new structure

### Phase 4: Test
1. Test with alt lines
2. Test without alt lines
3. Test across all sports
4. Test mobile

---

## Common Patterns to Find & Replace

### Pattern 1: Direct Value Display

**Find:**
```jsx
<div>{market.spread}</div>
```

**Replace:**
```jsx
<div className="spread-total-container">
    <div className="spread-total-value">{market.spread}</div>
    {market.altSpreads?.length > 0 && (
        <div className="alt-lines-badge" onClick={...}>ALT LINES</div>
    )}
</div>
```

### Pattern 2: Class-Based Value

**Find:**
```jsx
<div className="spread-value">{market.spread}</div>
```

**Replace:**
```jsx
<div className="spread-total-container">
    <div className="spread-total-value">{market.spread}</div>
    {market.altSpreads?.length > 0 && (
        <div className="alt-lines-badge" onClick={...}>ALT LINES</div>
    )}
</div>
```

### Pattern 3: Template String

**Find:**
```javascript
const html = `<div class="spread-value">${market.spread}</div>`;
```

**Replace:**
```javascript
const container = createSpreadTotalElement(market.spread, {
    altLines: market.altSpreads || [],
    onClick: () => openAltLinesModal('spread', market.altSpreads)
});
```

---

## Quick Reference

| What | Before | After |
|------|--------|-------|
| **Container** | None | `spread-total-container` |
| **Value Class** | `spread-value` | `spread-total-value` |
| **Badge** | None | `alt-lines-badge` (conditional) |
| **Data Field** | None | `altSpreads` / `altTotals` |
| **CSS File** | None | `alt-lines-badge.css` |
| **JS File** | None | `alt-lines-badge.js` |

---

## Success Criteria

✅ Badge appears when alt lines exist  
✅ Badge hidden when alt lines don't exist  
✅ Badge positioned below number  
✅ Click opens modal  
✅ Works for spread markets  
✅ Works for total markets  
✅ Works across all sports  
✅ Mobile responsive  
✅ No visual regressions  

---

## Need Help?

See the full implementation guide: `ALT_LINES_DEV_IMPLEMENTATION.md`
