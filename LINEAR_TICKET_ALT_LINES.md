# Add Alt Lines Badge to Spread and Total Markets

## Description

Add a small, subtle "ALT LINES" badge below spread and total values to indicate when alternative lines are available. The badge should only appear when alt lines exist, keeping the interface clean when they don't.

**Design:**
- Small purple/blue badge positioned below the number
- Text: "ALT LINES" in uppercase
- Only visible when alternative lines are available
- Clickable to open alt lines modal
- Works for all spread and total markets across all sports

## Acceptance Criteria

- [ ] Badge appears below spread values when `altSpreads` array has items
- [ ] Badge appears below total values when `altTotals` array has items
- [ ] Badge is hidden when alt lines arrays are empty or undefined
- [ ] Badge click opens the alt lines modal with correct data
- [ ] Badge is positioned correctly below the number (centered)
- [ ] Badge has proper hover state
- [ ] Works for NFL, NBA, MLB, and all other sports
- [ ] Mobile responsive and tappable
- [ ] No visual regressions
- [ ] No console errors

## Technical Implementation

### Files to Add

1. **`alt-lines-badge.css`** - Styles for the badge component
2. **`alt-lines-badge.js`** - Vanilla JavaScript utility functions
3. **`AltLinesBadge.tsx`** - React/TypeScript component (if using React)

### Data Structure Updates

Market objects need to include alt lines arrays:

```javascript
// Spread market
{
    spread: -3.5,
    spreadOdds: -110,
    altSpreads: [  // Add this field
        { value: -3, odds: -110 },
        { value: -4, odds: -105 }
    ]
}

// Total market
{
    total: 45.5,
    totalOdds: -112,
    altTotals: [  // Add this field
        { value: 44.5, odds: -110 },
        { value: 46.5, odds: -108 }
    ]
}
```

### Code Changes Required

**React/JSX Example:**
```jsx
// Before
<div className="spread-value">{market.spread}</div>

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

**Vanilla JavaScript Example:**
```javascript
// Use utility function
const container = createSpreadTotalElement(market.spread, {
    altLines: market.altSpreads || [],
    onClick: () => openAltLinesModal('spread', market.altSpreads)
});
```

## Implementation Steps

1. **Add CSS and JavaScript files** to project
2. **Update data structure** - Add `altSpreads` and `altTotals` arrays to market objects
3. **Find all spread market rendering locations** - Search for where spread values are displayed
4. **Find all total market rendering locations** - Search for where total/over-under values are displayed
5. **Replace spread rendering** - Update to use new container structure with conditional badge
6. **Replace total rendering** - Update to use new container structure with conditional badge
7. **Connect click handler** - Ensure badge click opens alt lines modal
8. **Test conditional rendering** - Verify badge shows/hides correctly
9. **Test across all sports** - Ensure it works for NFL, NBA, MLB, etc.
10. **Mobile testing** - Verify badge is tappable and looks good on mobile

## Files & Resources

All implementation files and documentation are available in the project:

- `alt-lines-badge.css` - Styles
- `alt-lines-badge.js` - JavaScript utilities
- `AltLinesBadge.tsx` - React component
- `ALT_LINES_DEV_IMPLEMENTATION.md` - Detailed step-by-step guide
- `ALT_LINES_QUICK_START.md` - Quick reference
- `ALT_LINES_BEFORE_AFTER.md` - Code comparison examples
- `alt-lines-example.html` - Working demo

## Design Specs

**Badge Styling:**
- Background: `#e0e7ff` (light purple/blue)
- Text Color: `#4338ca` (dark purple)
- Font Size: `8px`
- Font Weight: `700` (bold)
- Padding: `2px 6px`
- Border Radius: `8px`
- Text Transform: `uppercase`
- Letter Spacing: `0.5px`

**Hover State:**
- Background: `#c7d2fe` (slightly darker)
- Transform: `translateY(-1px)` (subtle lift)

**Positioning:**
- Container: `flex-direction: column`, `align-items: center`
- Gap: `4px` between value and badge
- Badge centered below the number

## Testing Checklist

### Functional Testing
- [ ] Badge appears when `altSpreads.length > 0`
- [ ] Badge appears when `altTotals.length > 0`
- [ ] Badge hidden when arrays are empty `[]`
- [ ] Badge hidden when arrays are undefined
- [ ] Click handler opens modal correctly
- [ ] Modal receives correct alt lines data

### Visual Testing
- [ ] Badge positioned correctly below number
- [ ] Badge is centered
- [ ] Hover state works
- [ ] No layout shifts when badge appears/disappears
- [ ] Looks good on desktop
- [ ] Looks good on tablet
- [ ] Looks good on mobile

### Cross-Sport Testing
- [ ] NFL games work
- [ ] NBA games work
- [ ] MLB games work
- [ ] Other sports work

### Edge Cases
- [ ] Handles null/undefined gracefully
- [ ] Handles empty arrays
- [ ] Handles missing market data
- [ ] Works with dynamic updates

## Notes

- Badge is intentionally small and subtle to avoid accidental clicks
- Only appears when alternative lines are actually available
- Works for both spread and total markets
- No changes needed to existing modal functionality (just pass the alt lines data)

## Related Documentation

See `ALT_LINES_DEV_IMPLEMENTATION.md` for complete step-by-step implementation guide with code examples, troubleshooting, and detailed instructions.

---

**Priority:** Medium  
**Estimate:** 4-6 hours  
**Labels:** `frontend`, `ui`, `betting-interface`, `feature`
