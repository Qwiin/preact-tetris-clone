export interface GameAction {
  type: ActionType;
  text: string;
  points: number;
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
  DROP,
  ROTATE,
  LEVEL_UP,
  GAME_OVER,
  PAUSE,
}

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