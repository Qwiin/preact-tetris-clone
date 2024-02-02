export interface GameAction {
  type: ActionType;
  text: string;
  points?: number;
  id?: string;
  transitioning?: boolean;
}

export const ToastTimeout: number = 1000;

export enum ActionType {
  SINGLE=1,
  DOUBLE,
  TRIPLE,
  TETRIS,
  MOVE,
  MOVE_DOWN,
  THUD,
  SET_PIECE,
  DROP,
  ROTATE,
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
  N=1,
  E,
  S,
  W
}


// O, Z, S, J, L, T, I
export enum TetronimoShape {
  O=0,
  Z,
  S,
  J,
  L,
  T,
  I
}

export const TETRONIMOS: number[][][] = [
  [
    [11, 11],
    [11, 11]
  ],
  [
    [22, 22, 0 ],
    [ 0, 22, 22],
  ],
  [
    [ 0, 33, 33],
    [33, 33,  0]
  ],
  [
    [44,  0,  0],
    [44, 44, 44]
  ],
  [
    [ 0,  0, 55],
    [55, 55, 55]
  ],
  [
    [ 0, 66, 0 ],
    [66, 66, 66]
  ],
  [
    [77, 77, 77, 77]
  ]
]