# Add Alt Lines Badge to Spread and Total Markets

## Summary

Add a small "ALT LINES" badge below spread and total values that appears only when alternative lines are available. Badge opens the alt lines modal on click.

## Description

Implement a subtle alt lines indicator badge that:
- Appears below spread/total numbers when alt lines exist
- Hides automatically when no alt lines available
- Opens alt lines modal on click
- Works for all spread and total markets across all sports

**Design:** Small purple/blue badge (8px font) positioned below the number, centered.

## Acceptance Criteria

- Badge shows when `altSpreads` or `altTotals` arrays have items
- Badge hidden when arrays are empty or undefined
- Click opens alt lines modal with correct data
- Positioned correctly below number (centered)
- Hover state works
- Mobile responsive and tappable
- Works across all sports (NFL, NBA, MLB, etc.)
- No visual regressions

## Technical Details

**Files to add:**
- `alt-lines-badge.css`
- `alt-lines-badge.js` (or `AltLinesBadge.tsx` for React)

**Data structure:**
```javascript
{
    spread: -3.5,
    altSpreads: [{ value: -3, odds: -110 }]  // Empty = no badge
}
```

**Code change:**
```jsx
// Wrap value in container, add conditional badge
<div className="spread-total-container">
    <div className="spread-total-value">{market.spread}</div>
    {market.altSpreads?.length > 0 && (
        <div className="alt-lines-badge" onClick={...}>ALT LINES</div>
    )}
</div>
```

## Implementation Steps

1. Add CSS/JS files to project
2. Update market data structure (add `altSpreads`/`altTotals` arrays)
3. Find all spread rendering locations
4. Find all total rendering locations
5. Replace with new container structure + conditional badge
6. Connect click handler to existing modal
7. Test conditional rendering
8. Test across all sports

## Resources

All files and docs available:
- `ALT_LINES_DEV_IMPLEMENTATION.md` - Full step-by-step guide
- `ALT_LINES_QUICK_START.md` - Quick reference
- `alt-lines-example.html` - Working demo

## Design Specs

- Background: `#e0e7ff`
- Text: `#4338ca`, 8px, bold, uppercase
- Padding: `2px 6px`
- Border radius: `8px`
- Gap below number: `4px`

---

**Priority:** Medium | **Estimate:** 4-6 hours | **Labels:** `frontend`, `ui`, `betting-interface`
