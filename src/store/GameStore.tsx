import { useCallback } from "preact/hooks";
import { AppState, useStore } from "./AppStore";

export const initialGameState: GameSlice = {
  gameMode: "marathon",
  gameStarted: false,
  gamePaused: false,
  gameOver: false,
  gameWon: false,
  gameReset: false,
  startingLevel: 1,
  timeGameStart: 0,
  timePauseStart: 0,
  timePausedTotal: 0,
  timeGameTotal: 0,
  timeGameEnd: 0,
}

/**
 * 
 * Interfaces
 * 
 */

export interface GameSlice {
  gameMode: "marathon" | "time_attack" | "campaign";
  gameStarted: boolean;
  gamePaused: boolean;
  gameReset: boolean;
  gameOver: boolean;
  gameWon: boolean;
  startingLevel: number;
  timeGameStart: number;
  timePauseStart: number;
  timePausedTotal: number;
  timeGameTotal: number;
  timeGameEnd: number;
}

/**
 * 
 * @Store_Selector
 * 
 */

export const gameSelector = (state: AppState): GameSlice => {
  return state.game;
}

/**
 * 
 * @Local_Types
 * This file is context specific, so for me
 * local generic types are better for 
 * readability
 * 
 * @type Slice: Partial<AppState> - refers to some first-level Parial of AppState
 * @type Sliver: Partial<Slice> - a slice of a slice
 */

type Slice = GameSlice;
type Sliver = Partial<Slice>;


/**
 * 
 * @Store_Hook
 * 
 */

export function useGameStore(): [Slice, (value: Sliver) => void] {

  const [GameSlice, storeSet] = useStore(gameSelector);
  const setGameSlice = useCallback(
    (value: Sliver) => {
      storeSet({ stats: value } as Partial<AppState>)
    }, []);

  return [GameSlice, setGameSlice];
}

export abstract class GameCommands {
  public static START_GAME: Sliver = { gameStarted: true };
  public static PAUSE: Sliver = { gamePaused: true };
  public static UNPAUSE: Sliver = { gamePaused: false };
  public static RESET: Sliver = { gameReset: true };
  public static RESET_COMPLETE: Sliver = { gameReset: false, gameOver: false, gameStarted: false };
  public static GAME_OVER: Sliver = { gameOver: true };
  public static GAME_WON: Sliver = { gameOver: true, gameWon: true };
}
