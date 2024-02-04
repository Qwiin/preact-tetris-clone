export interface GameAction {
  type: ActionType;
  text?: string;
  subtext?: string;
  points?: number;
  id?: string;
  transitioning?: boolean;
}

export const ToastTimeout: number = 1000;

export enum ActionType {
  SINGLE = 1,
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
  0.1236 * G,
  0.1775 * G,
  0.2598 * G,
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
  NULL=-1,
  O,
  Z,
  S,
  J,
  L,
  T,
  I
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


// more efficient way to copy items is to already have the string form
//   previously was using JSON.parse(JSON.stringify(arr));
export const TETRONIMOS_STRINGS: string[] = [

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
  TETRONIMO_I
];

// In the PieceQue, we don't need to copy the Tetronimo Array objects, 
// we can just reference the actual values, so this avoids a JSON.parse()
export const TETRONIMOS: number[][][] =
  TETRONIMOS_STRINGS.map((t: string) => { return JSON.parse(t) as number[][]; });