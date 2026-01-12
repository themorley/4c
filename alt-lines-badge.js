/**
 * Alt Lines Badge Utility
 * 
 * Provides functions to render and manage alt lines badges for spread and total markets.
 * Badge only appears when alternative lines are available.
 */

/**
 * Creates the HTML structure for a spread/total value with optional alt lines badge
 * 
 * @param {string|number} value - The spread or total value (e.g., "45.5" or "-3.5")
 * @param {Object} options - Configuration options
 * @param {Array} options.altLines - Array of alternative lines (empty array = no badge)
 * @param {Function} options.onClick - Click handler for the badge
 * @param {string} options.valueClass - Additional CSS class for the value element
 * @param {string} options.badgeClass - Additional CSS class for the badge element
 * @returns {string} HTML string
 */
function createSpreadTotalWithBadge(value, options = {}) {
    const {
        altLines = [],
        onClick = null,
        valueClass = '',
        badgeClass = ''
    } = options;

    const hasAltLines = altLines && altLines.length > 0;
    const valueClasses = `spread-total-value ${valueClass}`.trim();
    const badgeClasses = `alt-lines-badge ${hasAltLines ? '' : 'hidden'} ${badgeClass}`.trim();
    
    const onClickAttr = onClick ? `onclick="${onClick}"` : '';
    
    return `
        <div class="spread-total-container">
            <div class="${valueClasses}">${value}</div>
            <div class="${badgeClasses}" ${onClickAttr}>ALT LINES</div>
        </div>
    `;
}

/**
 * Creates DOM elements for spread/total with alt lines badge
 * 
 * @param {string|number} value - The spread or total value
 * @param {Object} options - Configuration options
 * @param {Array} options.altLines - Array of alternative lines
 * @param {Function} options.onClick - Click handler for the badge
 * @returns {HTMLElement} Container element
 */
function createSpreadTotalElement(value, options = {}) {
    const {
        altLines = [],
        onClick = null
    } = options;

    const container = document.createElement('div');
    container.className = 'spread-total-container';

    const valueEl = document.createElement('div');
    valueEl.className = 'spread-total-value';
    valueEl.textContent = value;
    container.appendChild(valueEl);

    const hasAltLines = altLines && altLines.length > 0;
    if (hasAltLines) {
        const badgeEl = document.createElement('div');
        badgeEl.className = 'alt-lines-badge';
        badgeEl.textContent = 'ALT LINES';
        
        if (onClick) {
            badgeEl.addEventListener('click', onClick);
        }
        
        container.appendChild(badgeEl);
    }

    return container;
}

/**
 * Updates an existing spread/total element to show/hide alt lines badge
 * 
 * @param {HTMLElement} container - The spread-total-container element
 * @param {Array} altLines - Array of alternative lines
 */
function updateAltLinesBadge(container, altLines = []) {
    const badge = container.querySelector('.alt-lines-badge');
    const hasAltLines = altLines && altLines.length > 0;

    if (hasAltLines) {
        if (!badge) {
            // Create badge if it doesn't exist
            const badgeEl = document.createElement('div');
            badgeEl.className = 'alt-lines-badge';
            badgeEl.textContent = 'ALT LINES';
            container.appendChild(badgeEl);
        } else {
            // Show existing badge
            badge.classList.remove('hidden');
        }
    } else {
        // Hide badge if no alt lines
        if (badge) {
            badge.classList.add('hidden');
        }
    }
}

/**
 * Checks if a market has alternative lines available
 * 
 * @param {Object} market - Market object
 * @param {string} marketType - 'spread' or 'total'
 * @returns {boolean} True if alt lines exist
 */
function hasAltLines(market, marketType) {
    if (!market || !marketType) return false;
    
    const altLinesKey = marketType === 'spread' 
        ? 'altSpreads' 
        : 'altTotals';
    
    const altLines = market[altLinesKey];
    return Array.isArray(altLines) && altLines.length > 0;
}

/**
 * Gets alternative lines for a market
 * 
 * @param {Object} market - Market object
 * @param {string} marketType - 'spread' or 'total'
 * @returns {Array} Array of alternative lines
 */
function getAltLines(market, marketType) {
    if (!hasAltLines(market, marketType)) {
        return [];
    }
    
    const altLinesKey = marketType === 'spread' 
        ? 'altSpreads' 
        : 'altTotals';
    
    return market[altLinesKey] || [];
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createSpreadTotalWithBadge,
        createSpreadTotalElement,
        updateAltLinesBadge,
        hasAltLines,
        getAltLines
    };
}
