import { useCallback } from "preact/hooks";
import { AppState, useStore } from "./AppStore";
import { initialStatsState } from "./InitialStates";

/**
 * 
 * Interfaces
 * 
 */

export interface PiecePoints {
  base: number;
  softDrop: number;
  hardDrop: number;
  combo: number;
  tSpin: number;
  total: number;
  backToBack: number;
  levelMultiplier: number;
}

export interface PieceMove {
  linesCleared: number;
  comboCount: number;
  pieceType: number;
  points: PiecePoints;
  timeStart: number;
  timeEnd: number;
}

export interface StatsSlice {
  level: number;
  lines: number;
  score: number;
  pieceMoves: PieceMove[];
  reset: boolean;
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

type Slice = StatsSlice;
type Sliver = Partial<Slice>;


/**
 * 
 * @Store_Selector
 * 
 */

export const statsSelector = (state: AppState): StatsSlice => {
  return state.stats;
}

/**
 * 
 * @Store_Hook
 * 
 */

export function useStatsStore(): [Slice, (value: Sliver) => void] {

  const [statsSlice, storeSet] = useStore(statsSelector);
  const setStatsSlice = useCallback(
    (value: Sliver) => {
      if (value.reset === true) {
        storeSet({ stats: initialStatsState });
      }
      else {
        storeSet({ stats: value } as Partial<AppState>);
      }
    }, []);

  return [statsSlice, setStatsSlice];
}
