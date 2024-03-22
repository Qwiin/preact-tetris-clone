/**
 * 
 * Initial States For AppStore Slices
 *  
 */

import { GameSlice } from "./GameStore";
import { SettingsSlice } from "./SettingsStore";
import { StatsSlice } from "./StatsStore";
import { UserSlice } from "./UserStore";


/**
 * 
 * User State
 *  
 */
export const initialUserState: UserSlice = {
  userInfo: null,
  preferences: {},
}


/**
 * 
 * Settings State
 *  
 */
export const initialSettingsState: SettingsSlice = {
  showOptions: false,
  soundEnabled: false,
  musicEnabled: false,
  isDevPanelOn: false,
  isNewTouchEnabled: false
}


/**
 * 
 * Game State
 *  
 */
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
 * Stats State
 *  
 */
export const initialStatsState: StatsSlice = {
  level: 1,
  lines: 0,
  score: 0,
  pieceMoves: [],
  reset: false
}
