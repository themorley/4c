# Alt Lines Badge - Quick Start Guide

## 🚀 5-Minute Integration

### Step 1: Add Files
```bash
# Copy these files to your project:
- alt-lines-badge.css
- alt-lines-badge.js (or AltLinesBadge.tsx for React)
```

### Step 2: Include in HTML
```html
<link rel="stylesheet" href="alt-lines-badge.css">
<script src="alt-lines-badge.js"></script>
```

### Step 3: Update Data Structure
```javascript
// Add alt lines arrays to your market objects
{
    spread: -3.5,
    altSpreads: [{ value: -3, odds: -110 }]  // Empty array = no badge
}
```

### Step 4: Replace Spread/Total Rendering

**React:**
```jsx
<div className="spread-total-container">
    <div className="spread-total-value">{market.spread}</div>
    {market.altSpreads?.length > 0 && (
        <div className="alt-lines-badge" onClick={() => openModal(market.altSpreads)}>
            ALT LINES
        </div>
    )}
</div>
```

**Vanilla JS:**
```javascript
const container = createSpreadTotalElement(market.spread, {
    altLines: market.altSpreads || [],
    onClick: () => openModal(market.altSpreads)
});
```

### Step 5: Test
- ✅ Badge shows when alt lines exist
- ✅ Badge hidden when alt lines don't exist
- ✅ Click opens modal

---

## 📋 Implementation Checklist

- [ ] CSS file added and loaded
- [ ] JavaScript file added and loaded
- [ ] Data structure updated (altSpreads/altTotals arrays)
- [ ] Spread markets updated
- [ ] Total markets updated
- [ ] Click handler connected
- [ ] Tested with alt lines
- [ ] Tested without alt lines
- [ ] Tested across all sports
- [ ] Mobile responsive

---

## 🎯 Key Points

- **Badge only shows** when `altLines.length > 0`
- **Works for** spread AND total markets
- **Works for** all sports (NFL, NBA, MLB, etc.)
- **Positioned** below the number, not as centerpiece
- **Small and subtle** - won't cause accidental clicks

---

## 📖 Full Documentation

See `ALT_LINES_DEV_IMPLEMENTATION.md` for detailed step-by-step guide.

---

## 🐛 Quick Troubleshooting

**Badge not showing?**
- Check `altLines` array has items
- Verify CSS is loaded
- Check browser console for errors

**Badge always showing?**
- Ensure empty arrays are used: `altSpreads: []`
- Check conditional rendering logic

**Not clickable?**
- Verify click handler is attached
- Check for z-index/pointer-events issues
