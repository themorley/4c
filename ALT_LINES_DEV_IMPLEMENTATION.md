# Alt Lines Badge - Developer Implementation Guide

## Overview

This guide will help you implement the alt lines badge feature across all spread and total markets. The badge appears below the spread/total number when alternative lines are available, and automatically hides when they don't exist.

**Design Spec:**
- Small purple/blue badge positioned below the number
- Text: "ALT LINES" in uppercase
- Only visible when alt lines exist
- Works for all sports (NFL, NBA, MLB, etc.)
- Works for both spread and total markets

---

## Step 1: Add CSS Styles

### 1.1 Copy the CSS File

Copy `alt-lines-badge.css` to your project's stylesheet directory, or add the styles directly to your main CSS file.

**File location:** `alt-lines-badge.css`

### 1.2 Include in Your Project

**Option A: Link in HTML**
```html
<link rel="stylesheet" href="path/to/alt-lines-badge.css">
```

**Option B: Import in CSS**
```css
@import url('path/to/alt-lines-badge.css');
```

**Option C: Add to Existing Stylesheet**
Copy the CSS rules from `alt-lines-badge.css` into your main stylesheet.

### 1.3 Verify CSS is Loaded

Open browser dev tools and check that `.alt-lines-badge` class exists in the stylesheet.

---

## Step 2: Add JavaScript Utility

### 2.1 Copy the JavaScript File

Copy `alt-lines-badge.js` to your project's JavaScript directory.

**File location:** `alt-lines-badge.js`

### 2.2 Include in Your Project

**Option A: Script Tag**
```html
<script src="path/to/alt-lines-badge.js"></script>
```

**Option B: ES6 Module**
```javascript
import { createSpreadTotalElement, hasAltLines, getAltLines } from './alt-lines-badge.js';
```

**Option C: Require (CommonJS)**
```javascript
const { createSpreadTotalElement, hasAltLines, getAltLines } = require('./alt-lines-badge.js');
```

### 2.3 Verify JavaScript is Loaded

Open browser console and type:
```javascript
typeof createSpreadTotalElement
// Should return: "function"
```

---

## Step 3: Update Your Data Structure

### 3.1 Identify Your Market Objects

Find where you store market data (spread/total). This might be:
- API response objects
- Database models
- State management (Redux, Zustand, etc.)
- Component props

### 3.2 Add Alt Lines Arrays

Ensure your market objects include alt lines arrays:

```javascript
// Spread market structure
{
    spread: -3.5,
    spreadOdds: -110,
    altSpreads: [  // Add this field
        { value: -3, odds: -110 },
        { value: -4, odds: -105 },
        { value: -4.5, odds: -100 }
    ]
}

// Total market structure
{
    total: 45.5,
    totalOdds: -112,
    altTotals: [  // Add this field
        { value: 44.5, odds: -110 },
        { value: 46.5, odds: -108 },
        { value: 47.5, odds: -105 }
    ]
}
```

### 3.3 Handle Missing Alt Lines

If alt lines don't exist, use an empty array or omit the field:

```javascript
// No alt lines - use empty array
{
    spread: -3.5,
    altSpreads: []  // Empty = no badge
}

// OR omit the field entirely
{
    spread: -3.5
    // altSpreads not included = no badge
}
```

---

## Step 4: Find Where Markets Are Rendered

### 4.1 Locate Spread Market Rendering

Search your codebase for where spread values are displayed:

**Search terms:**
- `spread`
- `Spread`
- `market.spread`
- `game.spread`
- Spread component names

**Common locations:**
- React components rendering market cards
- JavaScript functions building market HTML
- Template files (Handlebars, EJS, etc.)

### 4.2 Locate Total Market Rendering

Search for where total/over-under values are displayed:

**Search terms:**
- `total`
- `over/under`
- `Over/Under`
- `market.total`
- `game.total`

### 4.3 Identify the Rendering Pattern

Determine how markets are currently rendered:

**Pattern A: Direct HTML/JSX**
```jsx
<div className="spread-value">{market.spread}</div>
```

**Pattern B: Template Strings**
```javascript
const html = `<div class="spread-value">${market.spread}</div>`;
```

**Pattern C: Component**
```jsx
<SpreadValue value={market.spread} />
```

---

## Step 5: Replace Spread Market Rendering

### 5.1 Find the Spread Value Element

Locate the element that displays the spread number. It might look like:

```jsx
// Before
<div className="spread-value">{market.spread}</div>
```

or

```javascript
// Before
const spreadEl = document.createElement('div');
spreadEl.className = 'spread-value';
spreadEl.textContent = market.spread;
```

### 5.2 Replace with Container Component

**For React/JSX:**

```jsx
// After
<div className="spread-total-container">
    <div className="spread-total-value">{market.spread}</div>
    {market.altSpreads && market.altSpreads.length > 0 && (
        <div 
            className="alt-lines-badge"
            onClick={() => openAltLinesModal('spread', market.altSpreads)}
        >
            ALT LINES
        </div>
    )}
</div>
```

**For Vanilla JavaScript:**

```javascript
// After
const container = createSpreadTotalElement(market.spread, {
    altLines: market.altSpreads || [],
    onClick: () => openAltLinesModal('spread', market.altSpreads)
});
```

### 5.3 Update Your Component/Function

**Example: React Component**

```jsx
// Before
const MarketRow = ({ market }) => {
    return (
        <div className="market-row">
            <div className="market-label">Spread</div>
            <div className="spread-value">{market.spread}</div>
            <div className="odds">{market.spreadOdds}</div>
        </div>
    );
};

// After
const MarketRow = ({ market }) => {
    const handleAltLinesClick = () => {
        openAltLinesModal('spread', market.altSpreads);
    };

    return (
        <div className="market-row">
            <div className="market-label">Spread</div>
            <div className="spread-total-container">
                <div className="spread-total-value">{market.spread}</div>
                {market.altSpreads && market.altSpreads.length > 0 && (
                    <div 
                        className="alt-lines-badge"
                        onClick={handleAltLinesClick}
                    >
                        ALT LINES
                    </div>
                )}
            </div>
            <div className="odds">{market.spreadOdds}</div>
        </div>
    );
};
```

**Example: Vanilla JavaScript**

```javascript
// Before
function renderSpreadMarket(market) {
    const spreadEl = document.createElement('div');
    spreadEl.className = 'spread-value';
    spreadEl.textContent = market.spread;
    return spreadEl;
}

// After
function renderSpreadMarket(market) {
    return createSpreadTotalElement(market.spread, {
        altLines: market.altSpreads || [],
        onClick: () => openAltLinesModal('spread', market.altSpreads)
    });
}
```

---

## Step 6: Replace Total Market Rendering

### 6.1 Find the Total Value Element

Locate the element that displays the total number. Similar to step 5.1.

### 6.2 Replace with Container Component

**For React/JSX:**

```jsx
// After
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
```

**For Vanilla JavaScript:**

```javascript
// After
const container = createSpreadTotalElement(market.total, {
    altLines: market.altTotals || [],
    onClick: () => openAltLinesModal('total', market.altTotals)
});
```

### 6.3 Update Your Component/Function

Follow the same pattern as Step 5.3, but use `market.total` and `market.altTotals`.

---

## Step 7: Implement Click Handler

### 7.1 Create Modal Function

You need a function that opens the alt lines modal. This should already exist, but if not:

```javascript
/**
 * Opens the alt lines modal
 * @param {string} marketType - 'spread' or 'total'
 * @param {Array} altLines - Array of alternative lines
 */
function openAltLinesModal(marketType, altLines) {
    // Your existing modal opening logic
    // Pass marketType and altLines to the modal
    
    // Example:
    showModal({
        type: 'alt-lines',
        marketType: marketType,
        lines: altLines
    });
}
```

### 7.2 Connect to Badge Click

The badge click handler is already set up in Steps 5 and 6. Verify it calls your modal function:

```javascript
onClick: () => openAltLinesModal('spread', market.altSpreads)
```

### 7.3 Test Click Handler

1. Find a market with alt lines
2. Click the "ALT LINES" badge
3. Verify the modal opens with the correct alt lines

---

## Step 8: Test Conditional Rendering

### 8.1 Test with Alt Lines

**Test Case 1: Market WITH alt lines**
```javascript
const market = {
    spread: -3.5,
    altSpreads: [
        { value: -3, odds: -110 },
        { value: -4, odds: -105 }
    ]
};
```

**Expected Result:** Badge should be visible

### 8.2 Test without Alt Lines

**Test Case 2: Market WITHOUT alt lines (empty array)**
```javascript
const market = {
    spread: -3.5,
    altSpreads: []
};
```

**Expected Result:** Badge should NOT be visible

**Test Case 3: Market WITHOUT alt lines (missing field)**
```javascript
const market = {
    spread: -3.5
    // altSpreads not included
};
```

**Expected Result:** Badge should NOT be visible

### 8.3 Verify Across All Sports

Test that the badge works for:
- ✅ NFL games
- ✅ NBA games
- ✅ MLB games
- ✅ Other sports in your system

---

## Step 9: Handle Edge Cases

### 9.1 Null/Undefined Handling

Ensure your code handles null/undefined gracefully:

```javascript
// Safe approach
const altLines = market.altSpreads || [];
const container = createSpreadTotalElement(market.spread, {
    altLines: altLines,
    onClick: () => openAltLinesModal('spread', altLines)
});
```

### 9.2 Empty Array Handling

Empty arrays are automatically handled - badge won't show:

```javascript
// This is fine - badge won't appear
altLines: []
```

### 9.3 Missing Market Data

Handle cases where market data might be incomplete:

```javascript
const altLines = (market && market.altSpreads) ? market.altSpreads : [];
```

### 9.4 Dynamic Updates

If market data updates dynamically, update the badge:

```javascript
// If using vanilla JS utility
updateAltLinesBadge(containerElement, newAltLines);

// If using React, the component will re-render automatically
```

---

## Step 10: Styling Adjustments (If Needed)

### 10.1 Check Alignment

Verify the badge aligns correctly below the number:

```css
/* Adjust if needed */
.spread-total-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px; /* Adjust spacing if needed */
}
```

### 10.2 Mobile Responsiveness

Test on mobile devices. The badge should:
- Be tappable (not too small)
- Not overlap other elements
- Look good on small screens

### 10.3 Custom Brand Colors

If you need to match your brand colors:

```css
.alt-lines-badge {
    background: #YOUR_COLOR;
    color: #YOUR_TEXT_COLOR;
}

.alt-lines-badge:hover {
    background: #YOUR_HOVER_COLOR;
}
```

---

## Step 11: Accessibility

### 11.1 Add ARIA Labels (Vanilla JS)

```javascript
badgeEl.setAttribute('role', 'button');
badgeEl.setAttribute('aria-label', 'View alternative lines');
badgeEl.setAttribute('tabindex', '0');
```

### 11.2 Keyboard Support (Vanilla JS)

```javascript
badgeEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
    }
});
```

### 11.3 React Component

The React component (`AltLinesBadge.tsx`) already includes accessibility features.

---

## Step 12: Code Review Checklist

Before marking as complete, verify:

- [ ] CSS file is included and loaded
- [ ] JavaScript utility is included and loaded
- [ ] Spread markets show badge when alt lines exist
- [ ] Spread markets hide badge when alt lines don't exist
- [ ] Total markets show badge when alt lines exist
- [ ] Total markets hide badge when alt lines don't exist
- [ ] Badge click opens modal correctly
- [ ] Works across all sports (NFL, NBA, MLB, etc.)
- [ ] Badge is positioned correctly below number
- [ ] Hover state works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] No visual regressions

---

## Step 13: Integration Examples

### Example 1: React Component Integration

```jsx
import React from 'react';
import './alt-lines-badge.css';

interface Market {
    spread?: number;
    total?: number;
    altSpreads?: Array<{ value: number; odds: number }>;
    altTotals?: Array<{ value: number; odds: number }>;
}

const MarketCard: React.FC<{ market: Market }> = ({ market }) => {
    const handleSpreadAltLines = () => {
        openAltLinesModal('spread', market.altSpreads);
    };

    const handleTotalAltLines = () => {
        openAltLinesModal('total', market.altTotals);
    };

    return (
        <div className="market-card">
            {market.spread !== undefined && (
                <div className="market-row">
                    <div className="market-label">Spread</div>
                    <div className="spread-total-container">
                        <div className="spread-total-value">{market.spread}</div>
                        {market.altSpreads && market.altSpreads.length > 0 && (
                            <div 
                                className="alt-lines-badge"
                                onClick={handleSpreadAltLines}
                            >
                                ALT LINES
                            </div>
                        )}
                    </div>
                    <div className="odds">-110</div>
                </div>
            )}
            
            {market.total !== undefined && (
                <div className="market-row">
                    <div className="market-label">Over/Under</div>
                    <div className="spread-total-container">
                        <div className="spread-total-value">{market.total}</div>
                        {market.altTotals && market.altTotals.length > 0 && (
                            <div 
                                className="alt-lines-badge"
                                onClick={handleTotalAltLines}
                            >
                                ALT LINES
                            </div>
                        )}
                    </div>
                    <div className="odds">-112</div>
                </div>
            )}
        </div>
    );
};
```

### Example 2: Vanilla JavaScript Integration

```javascript
// Include the utility
import { createSpreadTotalElement } from './alt-lines-badge.js';

function renderMarketCard(market) {
    const card = document.createElement('div');
    card.className = 'market-card';

    // Spread market
    if (market.spread !== undefined) {
        const row = document.createElement('div');
        row.className = 'market-row';

        const label = document.createElement('div');
        label.className = 'market-label';
        label.textContent = 'Spread';
        row.appendChild(label);

        const spreadContainer = createSpreadTotalElement(market.spread, {
            altLines: market.altSpreads || [],
            onClick: () => openAltLinesModal('spread', market.altSpreads)
        });
        row.appendChild(spreadContainer);

        const odds = document.createElement('div');
        odds.className = 'odds';
        odds.textContent = '-110';
        row.appendChild(odds);

        card.appendChild(row);
    }

    // Total market
    if (market.total !== undefined) {
        const row = document.createElement('div');
        row.className = 'market-row';

        const label = document.createElement('div');
        label.className = 'market-label';
        label.textContent = 'Over/Under';
        row.appendChild(label);

        const totalContainer = createSpreadTotalElement(market.total, {
            altLines: market.altTotals || [],
            onClick: () => openAltLinesModal('total', market.altTotals)
        });
        row.appendChild(totalContainer);

        const odds = document.createElement('div');
        odds.className = 'odds';
        odds.textContent = '-112';
        row.appendChild(odds);

        card.appendChild(row);
    }

    return card;
}
```

### Example 3: Using React Component Library

If you're using the provided React component:

```jsx
import { SpreadTotalContainer } from './AltLinesBadge';
import './alt-lines-badge.css';

const MarketRow = ({ market }) => {
    return (
        <div className="market-row">
            <div className="market-label">Spread</div>
            <SpreadTotalContainer
                value={market.spread}
                altLines={market.altSpreads}
                onBadgeClick={() => openAltLinesModal('spread', market.altSpreads)}
            />
            <div className="odds">{market.spreadOdds}</div>
        </div>
    );
};
```

---

## Step 14: Testing Guide

### 14.1 Manual Testing Checklist

**Spread Markets:**
- [ ] Badge appears when `altSpreads` has items
- [ ] Badge hidden when `altSpreads` is empty
- [ ] Badge hidden when `altSpreads` is undefined
- [ ] Clicking badge opens modal with correct lines
- [ ] Badge positioned correctly below number
- [ ] Hover effect works

**Total Markets:**
- [ ] Badge appears when `altTotals` has items
- [ ] Badge hidden when `altTotals` is empty
- [ ] Badge hidden when `altTotals` is undefined
- [ ] Clicking badge opens modal with correct lines
- [ ] Badge positioned correctly below number
- [ ] Hover effect works

**Cross-Sport:**
- [ ] NFL games work
- [ ] NBA games work
- [ ] MLB games work
- [ ] Other sports work

**Responsive:**
- [ ] Desktop view looks good
- [ ] Tablet view looks good
- [ ] Mobile view looks good
- [ ] Badge is tappable on mobile

### 14.2 Automated Testing (Optional)

```javascript
// Example Jest test
describe('Alt Lines Badge', () => {
    test('shows badge when alt lines exist', () => {
        const market = {
            spread: -3.5,
            altSpreads: [{ value: -3, odds: -110 }]
        };
        const container = createSpreadTotalElement(market.spread, {
            altLines: market.altSpreads
        });
        const badge = container.querySelector('.alt-lines-badge');
        expect(badge).not.toBeNull();
        expect(badge.classList.contains('hidden')).toBe(false);
    });

    test('hides badge when no alt lines', () => {
        const market = {
            spread: -3.5,
            altSpreads: []
        };
        const container = createSpreadTotalElement(market.spread, {
            altLines: market.altSpreads
        });
        const badge = container.querySelector('.alt-lines-badge');
        expect(badge).toBeNull();
    });
});
```

---

## Step 15: Deployment

### 15.1 Pre-Deployment Checklist

- [ ] All files committed to version control
- [ ] CSS and JS files included in build
- [ ] No console errors
- [ ] Tested in staging environment
- [ ] Code reviewed

### 15.2 Deployment Steps

1. Deploy CSS file to CDN/server
2. Deploy JavaScript file to CDN/server
3. Deploy updated components/functions
4. Monitor for errors
5. Verify in production

### 15.3 Rollback Plan

If issues occur:
1. Revert component changes
2. Keep CSS/JS files (they won't break anything if unused)
3. Investigate issue
4. Fix and redeploy

---

## Troubleshooting

### Issue: Badge not showing when alt lines exist

**Check:**
1. CSS file is loaded
2. JavaScript utility is loaded
3. `altLines` array has items (not empty)
4. Container has correct class name
5. No CSS conflicts hiding the badge

**Debug:**
```javascript
console.log('Alt lines:', market.altSpreads);
console.log('Has alt lines:', hasAltLines(market, 'spread'));
```

### Issue: Badge showing when no alt lines

**Check:**
1. `altLines` is actually empty array `[]`, not `undefined`
2. Conditional rendering logic is correct
3. No default values being set

**Fix:**
```javascript
// Ensure you're checking length
{market.altSpreads && market.altSpreads.length > 0 && (
    <div className="alt-lines-badge">ALT LINES</div>
)}
```

### Issue: Badge not clickable

**Check:**
1. Click handler is attached
2. No z-index issues
3. No pointer-events: none
4. Modal function exists

**Debug:**
```javascript
badgeEl.addEventListener('click', (e) => {
    console.log('Badge clicked!', e);
    // Your handler
});
```

### Issue: Styling conflicts

**Check:**
1. CSS specificity
2. Conflicting class names
3. Parent element styles

**Fix:**
```css
/* Increase specificity if needed */
.market-row .alt-lines-badge {
    /* Your styles */
}
```

---

## Support

If you encounter issues not covered in this guide:

1. Check browser console for errors
2. Verify all files are loaded correctly
3. Test with the example file (`alt-lines-example.html`)
4. Review the implementation guide (`ALT_LINES_IMPLEMENTATION.md`)

---

## Summary

**Quick Integration Steps:**
1. ✅ Add CSS file
2. ✅ Add JavaScript file
3. ✅ Update data structure (add alt lines arrays)
4. ✅ Replace spread rendering
5. ✅ Replace total rendering
6. ✅ Connect click handler
7. ✅ Test conditional rendering
8. ✅ Deploy

**Key Points:**
- Badge only shows when alt lines exist
- Works for all spread and total markets
- Works across all sports
- Small and subtle design
- Easy to integrate

Good luck with the implementation! 🚀
