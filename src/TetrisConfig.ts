/* way of defining a region relative to the game board 
  {top: 19 left: 0, } would be the top-left of the lower-left grid cell 
*/
export interface BoardPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface GameAction {
  toast?: boolean;
  type: ActionType;
  classNames?: string[];
  text?: string;
  textSequence?: string[];
  textSequenceJoin?: string;
  subtext?: string;
  points?: number | string;
  combo?: number;
  comboPoints?: number;
  backToBack?: boolean;
  id?: string;
  timestamp?: number;
  boardPositions?: BoardPosition[];
  piecePosition: BoardPosition;
}

export const ToastTimeout: number = 500;
export const BaseToastDelay: number = 0.05;

export enum ActionType {
  NO_LINES_CLEARED=-1,
  NONE,  // 0
  SINGLE,
  DOUBLE,
  TRIPLE,
  TETRIS,
  LINE_CLEAR_DROP,
  MOVE,
  MOVE_DOWN,
  THUD,
  SET_PIECE,
  DROP,
  ROTATE,
  T_SPIN,
  T_SPIN_SINGLE,
  T_SPIN_DOUBLE,
  T_SPIN_TRIPLE,
  T_SPIN_MINI,
  T_SPIN_MINI_SINGLE,
  T_SPIN_MINI_DOUBLE,
  LEVEL_UP,
  GAME_OVER,
  PAUSE,
  HOLD_PIECE,
  MOVE_NOT_ALLOWED,
  BACK_TO_BACK,
}

export function getLabelForActionType(action: ActionType): string {

  switch(action) {
    case ActionType.SINGLE:
      return "Single";
    case ActionType.DOUBLE:
      return "Double";
    case ActionType.TRIPLE:
      return "Triple";
    case ActionType.TETRIS:
      return "TETRIS";
    case ActionType.T_SPIN:
      return "T-Spin";
    case ActionType.T_SPIN_SINGLE:
      return "T-Spin Single";
    case ActionType.T_SPIN_DOUBLE:
      return "T-Spin Double";
    case ActionType.T_SPIN_TRIPLE:
      return "T-Spin Triple";
    case ActionType.T_SPIN_MINI:
      return "T-Spin Mini";
    case ActionType.T_SPIN_MINI_SINGLE:
      return "T-Spin Mini Single";
    case ActionType.T_SPIN_MINI_DOUBLE:
      return "T-Spin Mini Double";
    case ActionType.GAME_OVER:
      return "Game Over";
    default:
      return action.toString();
  }
}

export const G: number = 3;  // cells per frame
export const GAME_SPEEDS = [
  0.01667 * G,
  0.021017 * G,
  0.026977 * G,
  0.035256 * G,
  0.04693 * G,
  0.06361 * G,
  0.0879 * G,
  0.1236 * G/1.2,
  0.1775 * G/1.3,
  0.2598 * G/1.4,
  // 0.388 * G,
  // 0.59 * G,
  // 0.92 * G,
  // 1.46 * G,
  // 2.36 * G,
]


export const ShapeColors: string[] = [
  'transparent',
  'yellow-400',
  'pink-600',
  'green-500',
  'blue-600',
  'orange-500',
  'violet-600',
  'blue-400',
];

export enum Direction {
  N = 1,
  E,
  S,
  W
}


export enum TetronimoShape {
  O = 0,
  Z,
  S,
  J,
  L,
  T,
  I,
  NULL
}

/*
  [][]
  [][]
*/
const TETRONIMO_O = `[[11, 11],[11, 11]]`;

/*

[][]
  [][]

*/
const TETRONIMO_Z = `[[22, 22, 0],[0, 22, 22]]`;

/*
 
  [][]
[][]

*/
const TETRONIMO_S = `[[ 0, 33, 33],[33, 33,  0]]`;

/*
 
[]
[][][]

*/
const TETRONIMO_J = `[[44,  0,  0],[44, 44, 44]]`;

/*

    []
[][][]

*/
const TETRONIMO_L = `[[0,  0, 55],[55, 55, 55]]`;

/*

  []
[][][]

*/
const TETRONIMO_T = `[[0, 66, 0],[66, 66, 66]]`;

/*

[][][][]

*/
const TETRONIMO_I = `[[77, 77, 77, 77]]`;

/* 

  empty

*/
const TETRONIMO_NULL = `[[0,0],[0,0]]`;


// more efficient way to copy items is to already have the string form
//   previously was using JSON.parse(JSON.stringify(arr));
export const TETRONIMO_STRINGS: string[] = [

  // O
  TETRONIMO_O,

  // Z
  TETRONIMO_Z,

  // S
  TETRONIMO_S,

  // J
  TETRONIMO_J,

  // L
  TETRONIMO_L,

  // T
  TETRONIMO_T,

  // I
  TETRONIMO_I,

  // NULL
  TETRONIMO_NULL
];

// In the PieceQue, we don't need to copy the Tetronimo Array objects, 
// we can just reference the actual values, so this avoids a JSON.parse()
export const TETRONIMOES: number[][][] =
  TETRONIMO_STRINGS.map((t: string) => { return JSON.parse(t) as number[][]; });