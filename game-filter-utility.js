/**
 * Utility functions for filtering games and props based on start time
 * 
 * This addresses the issue where games/props that have already started
 * are still showing up in the betting interface as if they can be bet on.
 */

/**
 * Checks if a game/prop has already started based on its start time
 * 
 * @param {string|Date} startTime - The game/prop start time (can be ISO string, Date object, or "7:00PM" format)
 * @param {Date} [currentTime] - Optional current time (defaults to now). Useful for testing.
 * @returns {boolean} - true if the game has started, false otherwise
 */
function hasGameStarted(startTime, currentTime = new Date()) {
  if (!startTime) {
    // If no start time provided, assume it hasn't started (or handle as needed)
    return false;
  }

  let gameStartDate;

  // Handle different input formats
  if (startTime instanceof Date) {
    gameStartDate = startTime;
  } else if (typeof startTime === 'string') {
    // Try parsing ISO string first
    if (startTime.includes('T') || startTime.includes('Z') || startTime.includes('+')) {
      gameStartDate = new Date(startTime);
    } else {
      // Handle "7:00PM" format - need to construct full date
      gameStartDate = parseTimeString(startTime);
    }
  } else {
    return false;
  }

  // Check if the date is valid
  if (isNaN(gameStartDate.getTime())) {
    console.warn('Invalid start time:', startTime);
    return false;
  }

  // Game has started if current time is >= start time
  return currentTime >= gameStartDate;
}

/**
 * Parses a time string like "7:00PM" into a Date object for today
 * Assumes the time is in the user's local timezone
 * 
 * @param {string} timeString - Time string in format like "7:00PM", "7:25PM", etc.
 * @returns {Date} - Date object for today at that time
 */
function parseTimeString(timeString) {
  // Remove whitespace and convert to uppercase
  const cleanTime = timeString.trim().toUpperCase();
  
  // Match patterns like "7:00PM", "7:25PM", "19:00", etc.
  const patterns = [
    /(\d{1,2}):(\d{2})(AM|PM)/,  // 7:00PM format
    /(\d{1,2}):(\d{2})/,          // 24-hour format (assumed PM if < 12)
  ];

  for (const pattern of patterns) {
    const match = cleanTime.match(pattern);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3] || (hours < 12 ? 'PM' : ''); // Default to PM for 24-hour if < 12

      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      // Create date for today at this time
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      // If the time has already passed today, assume it's for tomorrow
      // (This handles cases where we're viewing games later in the day)
      const now = new Date();
      if (date < now) {
        date.setDate(date.getDate() + 1);
      }

      return date;
    }
  }

  // If no pattern matches, return invalid date
  return new Date(NaN);
}

/**
 * Filters an array of games/props to only include those that haven't started yet
 * 
 * @param {Array} items - Array of game/prop objects
 * @param {string} startTimeField - Field name that contains the start time (e.g., 'startTime', 'gameStart', 'start')
 * @param {Date} [currentTime] - Optional current time (defaults to now)
 * @returns {Array} - Filtered array of items that haven't started
 */
function filterActiveGames(items, startTimeField = 'startTime', currentTime = new Date()) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(item => {
    const startTime = item[startTimeField];
    return !hasGameStarted(startTime, currentTime);
  });
}

/**
 * Checks if a game/prop can be bet on (hasn't started and is active)
 * 
 * @param {Object} game - Game/prop object
 * @param {string} startTimeField - Field name that contains the start time
 * @param {Date} [currentTime] - Optional current time (defaults to now)
 * @returns {boolean} - true if the game can be bet on
 */
function canBetOnGame(game, startTimeField = 'startTime', currentTime = new Date()) {
  if (!game) {
    return false;
  }

  // Check if game has started
  if (hasGameStarted(game[startTimeField], currentTime)) {
    return false;
  }

  // Add additional checks here if needed:
  // - Check if game is active/enabled
  // - Check if game is hidden
  // - Check if betting is allowed for this game type
  // etc.

  return true;
}

// Example usage and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    hasGameStarted,
    parseTimeString,
    filterActiveGames,
    canBetOnGame
  };
}

// Browser usage example:
/*
// Example 1: Filter games array
const games = [
  { id: 1, name: 'LAC vs NE', startTime: '7:25PM', odds: { spread: '+3.5' } },
  { id: 2, name: 'GB vs DET', startTime: '8:00PM', odds: { spread: '-5.5' } },
  { id: 3, name: 'SF vs SEA', startTime: '4:00PM', odds: { spread: '+7.5' } }, // Already started
];

const activeGames = filterActiveGames(games, 'startTime');
console.log('Active games:', activeGames); // Only games 1 and 2

// Example 2: Check individual game
const game = { id: 1, name: 'LAC vs NE', startTime: '7:25PM' };
if (canBetOnGame(game, 'startTime')) {
  // Show betting options
} else {
  // Hide game or show as "Live" status
}

// Example 3: With ISO date strings
const gamesWithISO = [
  { id: 1, startTime: '2024-01-15T19:25:00-05:00' },
  { id: 2, startTime: '2024-01-15T20:00:00-05:00' },
];
const active = filterActiveGames(gamesWithISO, 'startTime');
*/
