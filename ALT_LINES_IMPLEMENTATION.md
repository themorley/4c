# Alt Lines Badge Implementation Guide

## Overview

The alt lines badge is a small, subtle indicator that appears below spread and total values when alternative lines are available. It only displays when alt lines exist, keeping the interface clean when they don't.

## Design

- **Position**: Below the spread/total number, centered
- **Size**: Small, compact badge (8px font)
- **Color**: Purple/blue background (#e0e7ff) with dark purple text (#4338ca)
- **Text**: "ALT LINES" in uppercase
- **Behavior**: Only visible when alt lines exist

## Files

1. **`alt-lines-badge.css`** - CSS styles for the badge
2. **`alt-lines-badge.js`** - Vanilla JavaScript utility functions
3. **`AltLinesBadge.tsx`** - React/TypeScript component

## Usage

### Vanilla JavaScript/HTML

#### 1. Include the CSS

```html
<link rel="stylesheet" href="alt-lines-badge.css">
```

#### 2. Include the JavaScript

```html
<script src="alt-lines-badge.js"></script>
```

#### 3. Use in Your Code

**Option A: Create element programmatically**

```javascript
// Example: Spread market with alt lines
const spreadValue = -3.5;
const altSpreads = [
    { value: -3, odds: -110 },
    { value: -4, odds: -105 },
    { value: -4.5, odds: -100 }
];

const container = createSpreadTotalElement(spreadValue, {
    altLines: altSpreads,
    onClick: () => {
        // Open alt lines modal
        openAltLinesModal('spread', altSpreads);
    }
});

// Append to your market row
document.querySelector('.market-row').appendChild(container);
```

**Option B: Use HTML string**

```javascript
const html = createSpreadTotalWithBadge(45.5, {
    altLines: altTotals,
    onClick: 'openAltLinesModal("total", altTotals)'
});

document.querySelector('.market-row').innerHTML = html;
```

**Option C: Update existing element**

```javascript
// If you already have a spread-total-container element
const container = document.querySelector('.spread-total-container');
updateAltLinesBadge(container, altLines);
```

#### 4. Check if Alt Lines Exist

```javascript
const market = {
    spread: -3.5,
    altSpreads: [
        { value: -3, odds: -110 },
        { value: -4, odds: -105 }
    ]
};

if (hasAltLines(market, 'spread')) {
    const lines = getAltLines(market, 'spread');
    // Show badge with lines
}
```

### React/TypeScript

#### 1. Import the Component

```typescript
import { AltLinesBadge, SpreadTotalContainer } from './AltLinesBadge';
import './alt-lines-badge.css';
```

#### 2. Use the Component

**Option A: Just the Badge**

```tsx
interface MarketProps {
  spread: number;
  altSpreads?: Array<{ value: number; odds: number }>;
}

const MarketRow: React.FC<MarketProps> = ({ spread, altSpreads = [] }) => {
  const handleBadgeClick = () => {
    // Open alt lines modal
    openAltLinesModal('spread', altSpreads);
  };

  return (
    <div className="market-row">
      <div className="market-label">Spread</div>
      <div className="spread-total-container">
        <div className="spread-total-value">{spread}</div>
        <AltLinesBadge 
          altLines={altSpreads} 
          onClick={handleBadgeClick}
        />
      </div>
      <div className="odds">-110</div>
    </div>
  );
};
```

**Option B: Use the Container Component**

```tsx
const MarketRow: React.FC<MarketProps> = ({ spread, altSpreads = [] }) => {
  const handleBadgeClick = () => {
    openAltLinesModal('spread', altSpreads);
  };

  return (
    <div className="market-row">
      <div className="market-label">Spread</div>
      <SpreadTotalContainer
        value={spread}
        altLines={altSpreads}
        onBadgeClick={handleBadgeClick}
      />
      <div className="odds">-110</div>
    </div>
  );
};
```

**Option C: Use the Hook**

```tsx
import { useAltLines } from './AltLinesBadge';

const MarketRow: React.FC<MarketProps> = ({ spread, altSpreads = [] }) => {
  const hasAltLines = useAltLines(altSpreads);

  return (
    <div className="market-row">
      <div className="market-label">Spread</div>
      <div className="spread-total-container">
        <div className="spread-total-value">{spread}</div>
        {hasAltLines && (
          <AltLinesBadge 
            altLines={altSpreads} 
            onClick={() => openAltLinesModal('spread', altSpreads)}
          />
        )}
      </div>
      <div className="odds">-110</div>
    </div>
  );
};
```

## Data Structure

Your market objects should follow this structure:

```javascript
// Spread market
const spreadMarket = {
    spread: -3.5,
    spreadOdds: -110,
    altSpreads: [  // Only include if alt lines exist
        { value: -3, odds: -110 },
        { value: -4, odds: -105 },
        { value: -4.5, odds: -100 }
    ]
};

// Total market
const totalMarket = {
    total: 45.5,
    totalOdds: -112,
    altTotals: [  // Only include if alt lines exist
        { value: 44.5, odds: -110 },
        { value: 46.5, odds: -108 },
        { value: 47.5, odds: -105 }
    ]
};
```

## Integration Examples

### Example 1: Spread Market

```javascript
// In your market rendering function
function renderSpreadMarket(market) {
    const hasAlt = hasAltLines(market, 'spread');
    const altLines = getAltLines(market, 'spread');
    
    const container = createSpreadTotalElement(market.spread, {
        altLines: altLines,
        onClick: () => openAltLinesModal('spread', altLines)
    });
    
    return container;
}
```

### Example 2: Total Market

```javascript
function renderTotalMarket(market) {
    const container = createSpreadTotalElement(market.total, {
        altLines: market.altTotals || [],
        onClick: () => openAltLinesModal('total', market.altTotals)
    });
    
    return container;
}
```

### Example 3: React Component for All Markets

```tsx
interface Market {
  type: 'spread' | 'total';
  value: number;
  odds: number;
  altLines?: Array<{ value: number; odds: number }>;
}

const MarketDisplay: React.FC<{ market: Market }> = ({ market }) => {
  const handleClick = () => {
    openAltLinesModal(market.type, market.altLines);
  };

  return (
    <div className="market-row">
      <div className="market-label">
        {market.type === 'spread' ? 'Spread' : 'Over/Under'}
      </div>
      <SpreadTotalContainer
        value={market.value}
        altLines={market.altLines}
        onBadgeClick={handleClick}
      />
      <div className="odds">{market.odds}</div>
    </div>
  );
};
```

## Conditional Rendering

The badge automatically hides when:
- `altLines` is `undefined` or `null`
- `altLines` is an empty array `[]`
- `altLines.length === 0`

No need to manually check - the component handles it!

## Styling Customization

You can customize the badge by:

1. **Modifying CSS variables** (add to your stylesheet):
```css
.alt-lines-badge {
    --badge-bg: #e0e7ff;
    --badge-text: #4338ca;
    --badge-hover-bg: #c7d2fe;
}
```

2. **Adding custom classes**:
```javascript
createSpreadTotalElement(value, {
    altLines: lines,
    badgeClass: 'custom-badge-style'
});
```

3. **Overriding styles**:
```css
.my-custom-market .alt-lines-badge {
    font-size: 9px;
    padding: 3px 8px;
}
```

## Accessibility

The React component includes:
- `role="button"` for screen readers
- Keyboard support (Enter/Space to activate)
- Proper tab indexing

For vanilla JS, add these attributes:

```javascript
badgeEl.setAttribute('role', 'button');
badgeEl.setAttribute('tabindex', '0');
badgeEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
    }
});
```

## Testing

Test that the badge:
1. ✅ Shows when alt lines exist
2. ✅ Hides when alt lines don't exist
3. ✅ Hides when alt lines array is empty
4. ✅ Opens modal on click
5. ✅ Has proper hover state
6. ✅ Works on mobile (touch targets)

## Notes

- Badge is intentionally small and subtle to avoid accidental clicks
- Positioned below the number, not as a centerpiece
- Works for all sports (NFL, NBA, MLB, etc.)
- Works for both spread and total markets
- Only appears when alternative lines are actually available
