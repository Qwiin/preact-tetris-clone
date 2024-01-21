import { Ref } from 'preact';
import { useRef, useEffect } from 'preact/hooks';
import { Signal, signal } from '@preact/signals';
import { act } from 'preact/test-utils';

const tick: Signal<number> = signal(0);

setInterval(() => {
  tick.value = tick.value + 1;
}, 500);

const colorEnum: string[] = [
  'transparent',
  'blue-400',
  'blue-700',
  'red-400',
  'yellow-500',
  'green-500',
  'red-700',
];

interface GameProps {
  init: boolean;
  keydownCallback: (key: string) => void;
}

enum Direction {
  N=0,
  E,
  S,
  W
}

const rotateMatrix = (matrix: number[][], toDirection: Direction | number): number[][] => {
  let matrixT: number[][] = [];
  const nR = matrix.length;
  const nC = matrix[0].length;

  let i=0, iT=0;
  let j=0;

  switch(toDirection) {

    // forward rows, forward cols
    case Direction.N:
    case 0:
      matrixT = JSON.parse(JSON.stringify(matrix));
      break;

    // forward cols, reverse rows
    case Direction.E:
    case 1:

      for(i=0; i<nC; i++) {
        matrixT[iT] = [];
        for(j=nR-1; j>=0; j--) {
          matrixT[iT].push(matrix[i][j]);
        }
        iT++;
      }
      break;

    // reverse rows, reverse cols
    case Direction.S:
    case 2:

      for(i=nR-1; i>=0; i--) {
        matrixT[iT] = [];
        for(j=nC-1; j>=0; j--) {
          matrixT[i].push(matrix[i][j]);
        }
        iT++;
      }
      break;

    case Direction.W: 
    case 3: 
    
    // reverse cols, forward rows
    for(i=nC-1; i>=0; i++) {
      matrixT[iT] = [];
      for(j=0; j<nR; j++) {
          matrixT[iT].push(matrix[i][j])
        }
        iT++;
      }
      break;
  }

  return matrixT;
}

class ActivePiece {
  
  lastTick: number = -1;

  x: number = 4;
  xPrev: number = 4;
  y: number = 4;
  yPrev: number = -1;
  rotation: Direction = Direction.N;
  readonly shape: number[][] = [];

  readonly shapeByDirection: number[][][] = [];

  constructor(shape?: number[][], rotation?: Direction, x?: number, y?: number) {

    if(shape) {
      this.shape = JSON.parse(JSON.stringify(shape));
      this.shapeByDirection[Direction.N] = JSON.parse(JSON.stringify(this.shape));
      if(rotation) {
        this.rotation = rotation;
      }
      if(x) {
        this.x = Math.floor((10 - this.shape[0].length) / 2);
        this.xPrev = this.x;
      }
      if(y) {
        this.y = y;
        this.yPrev = y-1;
      }
    }
  }

  rotateLeft() {
    if(this.rotation === Direction.N) {
      this.rotation = Direction.W;
    }
    else {
      this.rotation -= 1;
    }
  }

  rotateRight() {
    if(this.rotation === Direction.W) {
      this.rotation = Direction.N;
    }
    else {
      this.rotation += 1;
    }
  }

  getPermutation(): number[][] {
    
    if(!this.shapeByDirection[this.rotation]){
      this.shapeByDirection[this.rotation] = rotateMatrix(this.shape, this.rotation);
    }

    return this.shapeByDirection[this.rotation];
  }

  getWidthProjection(): number {
    return this.getPermutation()[0].length 
  }
}

const rotationMatrices = [

  [
    [ 1, 0 ],
    [ 0, 1 ]
  ],
  [
    [ 0,-1 ],
    [ 1, 0 ]
  ],
  [
    [-1, 0 ],
    [ 0,-1 ]
  ],
  [
    [ 0, 1 ],
    [-1, 0 ]
  ],

];

const TETRONIMOS: number[][][] = [
  [
    [11,11],
    [11,11]
  ],
  [
    [22, 0],
    [22,22],
    [0, 22]
  ],
  [
    [0 ,33],
    [33,33],
    [33, 0]
  ],
  [
    [ 0,44],
    [ 0,44],
    [44,44]
  ],
  [
    [55, 0],
    [55, 0],
    [55,55]
  ],
  [
    [66],
    [66],
    [66],
    [66]
  ]
]

export default function Game(props: GameProps) {

  if(!props.init) {
    return;
  }

  // const [count, setCount] = useState(0);

  const emptyRow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const activePiece: Ref<ActivePiece> = useRef(null);

  const board: Ref<number[][]> = useRef([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 6, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 6, 6, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 6, 1, 0],
    [4, 4, 2, 3, 5, 2, 2, 2, 1, 2],
    [4, 4, 2, 3, 0, 0, 6, 2, 1, 2],
    [0, 2, 2, 3, 3, 5, 6, 0, 2, 2],
  ]);

  const getBoardCols = () => {
    if(!board.current){
      return;
    }

    let rowLen = board.current[0].length;
    let cells = board.current.flat();
    let colLen = board.current.length;
    let boardCols = [];
    for (let i = 0; i < rowLen; i++) {
      let col: number[] = [];
      for (let j = 0; j < colLen; j++) {
        col.push(cells[j * rowLen + i]);
      }
      boardCols.push(col);
    }
  };

  const updatePosition = () => {
    if(!board.current || !activePiece.current) {return}

    // const rows: number[][] = JSON.parse(JSON.stringify(board.current));
    const p: ActivePiece = activePiece.current;
    const perm: number[][] = p.getPermutation();
    const h: number = perm.length;
    const w: number = perm[0].length;

    let j_i = p.x;
    let i_i = p.y - h;

    let i_s = h-1;
    
    let canMoveDown = true;
    for(let i=i_i; i > (i_i - h); i--) {
      let j_s = 0;
      for(let j=j_i; j < (j_i + w); j++) {
        if(perm[i_s][j_s] > 0 && i >= 0 && j >= 0 && board.current[i][j] !== 0 && board.current[i][j] !== perm[i_s][j_s]) {
          canMoveDown = false;
          p.y = p.yPrev;
        }
        j_s++;
      } 
      i_s--;
    }

    // TODO: optimize
    if(canMoveDown) { 

      // erase old location
      let j_i = p.xPrev;
      let i_i = p.yPrev - h;

      let i_se = h-1;
      for(let i=i_i; i > (i_i - h); i--) {
        let j_s = 0;
        for(let j=j_i; j < (j_i + w); j++) {
          if(perm[i_se][j_s] > 0 && i >= 0 && j >= 0 && board.current[i][j] !== 0) {
            board.current[i][j] = 0;
            console.log(`[${i_se},${j_s}]`);
          }
        
          j_s++;
        }
        i_se--;
      }
      console.log(`---`);

      p.xPrev = p.x;

      // write new location
      j_i = p.x;
      i_i = p.y - h;

      let i_ss = h-1;
      for(let i=i_i; i > (i_i - h); i--) {
        let j_s = 0;
        for(let j=j_i; j < (j_i + w); j++) {
          if(perm[i_ss][j_s] > 0 && i >= 0 && j >= 0 && board.current[i][j] === 0) {
            board.current[i][j] = perm[i_ss][j_s];
          }
          j_s++;
        }
        i_ss--;
      }

      // board.current = rows;
    }

  }



  const updateBoard = (tickValue: number, piece?: ActivePiece | null) => {

    if(tickValue < 0 || !board.current) {
      return;
    }

    const rows = board.current;
    const nRows = rows.length;

    const newRows = rows.filter((row) => {
      if (row.includes(0)) {
        return true;
      }
      return false;
    });

    if(piece) {

      if(piece.y === piece.yPrev) {
        for(let i=0;  i<board.current.length; i++) {
          for(let j=0;  j<board.current[0].length; j++) {
            if(board.current[i][j] > 10) {
              board.current[i][j] = board.current[i][j] / 11; 
            }
          }
        }
        activePiece.current = getRandomPiece();
        return;
      }

      if(piece.lastTick != tick.value){
        piece.yPrev = piece.y;
        piece.y += 1; 
        piece.lastTick = tick.value;
        updatePosition()
      }

      
    }
    // else 
    {
      // clear rows
      let nNewRows = newRows.length;
      for (let i = 0; i < nRows - nNewRows; i++) {
        newRows.unshift([...emptyRow]);
      }

      // updateRef
      for (let i = 0; i < nRows; i++) {
        board.current[i] = [...newRows[i]];
      }
    }
  };

  const getRandomPiece = () => {
    let index: number = Math.round(Math.random() * (TETRONIMOS.length-1));
    let shape: number[][] = TETRONIMOS[index];
    return new ActivePiece(shape)
  }

  const keydownHandler = (e:KeyboardEvent) => {
    
    props.keydownCallback(e.key);
    if(!activePiece.current || !board.current) {
      return;
    }
    switch(e.key) {
      case "ArrowRight":
        if(activePiece.current.x < board.current[0].length) {
          activePiece.current.xPrev = activePiece.current.x;
          activePiece.current.x += 1; 
        }
        break;
      case "ArrowLeft":
        if(activePiece.current.x > 0) {
          activePiece.current.xPrev = activePiece.current.x;
          activePiece.current.x -= 1; 
        }
        break;
    }
  }

  useEffect(()=>{
    setTimeout(()=> {
      activePiece.current = getRandomPiece();
    },1000);
  
    document.addEventListener("keydown", keydownHandler);
    return () => {
      document.removeEventListener("keydown", keydownHandler);
    }
  },[]);


  useEffect(() => {
    updateBoard(tick.value, activePiece.current);
  });

  const renderBoard = () => {
    if(!board.current){
      return
    };

    const rows = board.current;
    
    return rows.map((row) => {
      return (
        <div className="tw-flex tw-flex-row tw-gap-0">
          {row.map((cellValue) => {
            let colorEnumVal = cellValue > 10 ? colorEnum[cellValue/11] : colorEnum[cellValue]
            let cellColor =
              cellValue === 0
                ? 'tw-bg-transparent'
                : `tw-border tw-bg-${colorEnumVal} tw-border-${colorEnumVal} tw-border-outset`;
            return (
              <div
                className={`tw-h-4 tw-w-4 ${cellColor} tw-box-border`}
                style={{ borderStyle: (cellValue === 0 ? 'none' : 'outset') }}
              ></div>
            );
          })}
        </div>
      );
    });

  };

  return (
    <>
    <div>
      <h1 className="bg-green-100">{tick.value}</h1>
      <div class="container tw-pt-2">
        <div className="tw-h-80 tw-w-40 tw-bg-blue-100 tw-flex tw-flex-col tw-gap-0 tw-">
          {renderBoard()}
        </div>
      </div>
    </div>
    </>
  );
};
