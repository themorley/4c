/**
 * Example React component showing how to filter games/props by start time
 * 
 * This demonstrates how to fix the issue where games that have started
 * are still showing as bettable.
 */

import React, { useMemo } from 'react';
import { hasGameStarted, filterActiveGames, canBetOnGame } from './game-filter-utility';

interface Game {
  id: string;
  name: string;
  startTime: string; // e.g., "7:00PM" or ISO string
  odds: {
    spread?: string;
    moneyline?: string;
    total?: string;
  };
  matchedVolume?: number;
}

interface Props {
  id: string;
  title: string;
  startTime: string; // e.g., "7:00PM"
  options: {
    over: string;
    under: string;
  };
}

interface GameListProps {
  games: Game[];
  props: Props[];
}

/**
 * Component that displays only bettable games (those that haven't started)
 */
export const BettableGamesList: React.FC<GameListProps> = ({ games, props }) => {
  // Filter out games that have already started
  const bettableGames = useMemo(() => {
    return filterActiveGames(games, 'startTime');
  }, [games]);

  // Filter out props that have already started
  const bettableProps = useMemo(() => {
    return filterActiveGames(props, 'startTime');
  }, [props]);

  return (
    <div>
      <h2>Available Games</h2>
      {bettableGames.length === 0 ? (
        <p>No games available for betting</p>
      ) : (
        <ul>
          {bettableGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </ul>
      )}

      <h2>Available Props</h2>
      {bettableProps.length === 0 ? (
        <p>No props available for betting</p>
      ) : (
        <ul>
          {bettableProps.map(prop => (
            <PropCard key={prop.id} prop={prop} />
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Individual game card - only renders if game can be bet on
 */
const GameCard: React.FC<{ game: Game }> = ({ game }) => {
  // Double-check that this game can be bet on
  if (!canBetOnGame(game, 'startTime')) {
    return null; // Don't render if game has started
  }

  return (
    <li className="game-card">
      <h3>{game.name}</h3>
      <p>Start: {game.startTime}</p>
      {game.odds.spread && <p>Spread: {game.odds.spread}</p>}
      {game.odds.moneyline && <p>Moneyline: {game.odds.moneyline}</p>}
      {game.matchedVolume && <p>Matched Volume: ${game.matchedVolume.toLocaleString()}</p>}
      <button>Place Bet</button>
    </li>
  );
};

/**
 * Individual prop card - only renders if prop can be bet on
 */
const PropCard: React.FC<{ prop: Props }> = ({ prop }) => {
  // Check if prop can be bet on
  if (!canBetOnGame(prop, 'startTime')) {
    return null; // Don't render if prop has started
  }

  return (
    <li className="prop-card">
      <h3>{prop.title}</h3>
      <p>Start: {prop.startTime}</p>
      <div className="prop-options">
        <button>{prop.options.over}</button>
        <button>{prop.options.under}</button>
      </div>
    </li>
  );
};

/**
 * Alternative: Component that shows all games but marks started ones differently
 */
export const AllGamesListWithStatus: React.FC<GameListProps> = ({ games, props }) => {
  return (
    <div>
      <h2>All Games</h2>
      <ul>
        {games.map(game => {
          const hasStarted = hasGameStarted(game.startTime);
          return (
            <li key={game.id} className={hasStarted ? 'game-started' : 'game-active'}>
              <h3>{game.name}</h3>
              <p>Start: {game.startTime}</p>
              {hasStarted ? (
                <div>
                  <span className="status-badge">LIVE - No Bets Available</span>
                  {/* Don't show betting options or matched volume */}
                </div>
              ) : (
                <div>
                  {/* Show normal betting interface */}
                  {game.odds.spread && <p>Spread: {game.odds.spread}</p>}
                  <button>Place Bet</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * Hook for checking if games/props can be bet on
 */
export const useBettableGames = <T extends { startTime: string }>(
  items: T[],
  startTimeField: keyof T = 'startTime'
) => {
  return useMemo(() => {
    return filterActiveGames(items, startTimeField as string);
  }, [items, startTimeField]);
};

// Usage example:
/*
const MyComponent = () => {
  const [games, setGames] = useState<Game[]>([]);
  const bettableGames = useBettableGames(games);

  return <BettableGamesList games={bettableGames} props={[]} />;
};
*/
