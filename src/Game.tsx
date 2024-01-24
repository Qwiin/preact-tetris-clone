/**

TODO:

Gameplay:

  1. Implement GameOver State
  2. Fix Collision Detection with left/right moves and rotation against set blocks
  3. Implement Que (as a stack)
  4. Balance the distribution of pieces (native RNG does not feel like Tetris, lol)
    a. There should be a more normal distribution considering a game to 100 lines is only 250-300 pieces

UI/UX:
  
  1. Styleize UI
  2. Add Sound
  3. Break this out into multiple components

Performance:

  1. Use 1D array for gameboard
  2. Move Model into it's own class to decouple game logic from view
  3. 

**/

import { Ref } from 'preact';
import { useRef, useEffect } from 'preact/hooks';
import { Signal, signal } from '@preact/signals';
import './app.css';
import { StatsPanel } from './StatsPanel';

const TICK_INTERVAL: number = 200;
const PIECE_QUE_LENGTH: number = 5;
const PIECE_INDEXES_QUE_LENGTH: number = 40;

const tick: Signal<number> = signal(0);

// const actionSignal: Signal<string> = signal("action");

const colorEnum: string[] = [
  'transparent',
  'yellow-400',
  'pink-600',
  'green-500',
  'blue-600',
  'orange-500',
  'violet-600',
  'blue-400',
];

interface GameProps {
  numColumns?: number;
  numRows?: number;
  init: boolean;
  keydownCallback: (key: string) => void;
  actionCallback: (action: string) => void;
}

interface Scoring {
  score: number;
  lines: number;
  level: number;
}

enum Direction {
  N=1,
  E,
  S,
  W
}

const rotateMatrix = (matrix: number[][], toDirection: Direction | number): number[][] => {

  if(toDirection === Direction.N){
    return JSON.parse(JSON.stringify(matrix));
  }

  let matrixT: number[][] = [];
  const nR = matrix.length;
  const nC = matrix[0].length;

  let iT=0;
  
  switch(toDirection) {

    // forward cols, reverse rows
    case Direction.E:

      for(let i=0; i<nC; i++) {
        matrixT[iT] = [];
        for(let j=nR-1; j>=0; j--) {
          matrixT[iT].push(matrix[j][i]);
        }
        // console.log(JSON.stringify(matrixT[iT]));
        iT++;
      }
      break;


    // reverse rows, reverse cols
    case Direction.S:

      for(let i=nR-1; i>=0; i--) {
        matrixT[iT] = [];
        for(let j=nC-1; j>=0; j--) {
          matrixT[iT].push(matrix[i][j]);
        }
        // console.log(JSON.stringify(matrixT[iT]));
        iT++;
      }
      break;


    // reverse cols, forward rows
    case Direction.W: 
    
      for(let i=nC-1; i>=0; i--) {
      matrixT[iT] = [];
      for(let j=0; j<nR; j++) {
          matrixT[iT].push(matrix[j][i]);
        }
        // console.log(JSON.stringify(matrixT[iT]));
        iT++;
      }
      break;
  }

  return matrixT;
}

class ActivePiece {

  dropped: boolean = false;

  readonly xMax: number = 10;
  readonly xMin: number = 0;
  readonly yMax: number = 24;
  readonly yMin: number = 0;

  private _coords: Uint8Array = new Uint8Array(4);
  public set coords(value: Uint8Array) {
    for(let i=0; i<value.length; i++){
      this._coords[i] = value[i];
    }
  }
  public get coords(): Uint8Array {
    return this._coords;
  }

  lastTick: number = -1;

  x: number = 4;
  xPrev: number = 4;
  y: number = 4;
  yPrev: number = -1;
  rotation: Direction = Direction.N;
  rotationPrev: Direction = Direction.N;
  readonly shape: number[][] = [];

  readonly shapeByDirection: number[][][] = [];

  constructor(shape?: number[][], rotation?: Direction, coords?: Uint8Array, x?: number, y?: number) {

    if(shape) {
      this.shape = shape;
      this.shapeByDirection[Direction.N] = this.shape;
      if(rotation) {
        this.rotation = rotation;
        this.rotationPrev = rotation;
      }
      if(x) {
        this.x = Math.floor((10 - this.shape[0].length) / 2);
        this.xPrev = this.x;
      }
      if(y) {
        this.y = y;
        this.yPrev = y-1;
      }
      if(coords) {
        this.coords = coords;
      }
    }
  }

  rotateLeft() {
    this.rotationPrev = this.rotation;
    if(this.rotation === Direction.N) {
      this.rotation = Direction.W;
    }
    else {
      this.rotation -= 1;
    }
    this.xAdjustAfterRotation();
    this.yAdjustAfterRotation();
  }

  rotateRight() {
    this.rotationPrev = this.rotation;
    if(this.rotation === Direction.W) {
      this.rotation = Direction.N;
    }
    else {
      this.rotation += 1;
    }
    this.xAdjustAfterRotation();
    this.yAdjustAfterRotation();
  }

  private xAdjustAfterRotation() {
    // console.log({'rotationChange': `${this.rotationPrev} -> ${this.rotation}`});
    // console.log({'       xChange': `${this.xPrev} -> ${this.x}`});
    // console.log({'       yChange': `${this.yPrev} -> ${this.y}`});
    let dWidth = this.width - this.widthPrev;
    if(dWidth !== 0) {
      

      // TODO: clean up

      let newX: number = (this.rotation === Direction.E) 
        ? (this.x + 1) 
        : (this.rotation !== this.rotationPrev && this.rotationPrev === Direction.E) 
          ? this.x - 1
          : this.x;

      if(this.width === 1) {
        if (this.rotation === Direction.E) {
          newX = this.x + 2;
        }
        else if (this.rotation === Direction.W) {
          newX = this.x + 1;
        }
      }
      else if(this.width === 4) { 
        if(this.rotationPrev === Direction.E) {
          newX = this.x - 2;
        }
        if(this.rotationPrev === Direction.W) {
          newX = this.x - 1;
        }
      }

      this.xPrev = this.x;
      if(newX < this.xMin) {
        this.x = this.xMin;
      }
      else if(newX > this.xMax - this.width) {
        this.x = this.xMax - this.width;
      }
      else {
        this.x = newX;
      }
    }
  }
  private yAdjustAfterRotation() {
    // console.log({'rotationChange': `${this.rotationPrev} -> ${this.rotation}`});
    // console.log({'       xChange': `${this.xPrev} -> ${this.x}`});
    // console.log({'       yChange': `${this.yPrev} -> ${this.y}`});
    let dHeight = this.height - this.heightPrev;
    if(dHeight !== 0) {
      // let d: number = this.y;// - Math.abs(dHeight * (Math.sin(Math.PI / 2 * (this.rotation - 1))));

      let newY: number = (this.rotation !== this.rotationPrev && this.rotationPrev === Direction.N) 
        ? (this.y + 1) 
        : (this.rotation === Direction.N) 
          ? this.y - 1
          : this.y;


      if(newY < this.yMin) {
        this.y = this.yMin;
      }
      else if(newY >= this.yMax) {
        this.y = this.yMax;
      }
      else {
        this.y = newY;
      }
      this.yPrev = this.y - 1;
    }
  }

  get permutationPrev(): number[][] {
    if(!this.shapeByDirection[this.rotationPrev]){
      this.shapeByDirection[this.rotationPrev] = rotateMatrix(this.shape, this.rotationPrev);
    }

    return this.shapeByDirection[this.rotationPrev];
  }

  get permutation(): number[][] {
    if(!this.shapeByDirection[this.rotation]){
      this.shapeByDirection[this.rotation] = rotateMatrix(this.shape, this.rotation);
    }

    return this.shapeByDirection[this.rotation];
  }

  get height(): number {
    return this.permutation.length;
  }
  get heightPrev(): number {
    return this.permutationPrev.length;
  }

  get width(): number {
    return this.permutation[0].length;
  }
  get widthPrev(): number {
    return this.permutationPrev[0].length;
  }

  getWidthProjection(): number {
    return this.permutation[0].length 
  }
}

const TETRONIMO_SIZE: number = 4;
const TETRONIMOS: number[][][] = [
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

/**
 * 
 * @param count - number of indexes to generate
 * @param maxIndex - largest value
 * @param minIndex - smallest value
 * @returns 
 */
function evenDistributionRandomIndexes(count: number, maxIndex: number, minIndex: number = 0): number[] {
  const indexes = [];

  for (let i = 0; i < count; i++) {
    
    const randomIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1));
    indexes.push(randomIndex);

    if(i > 2) {
      if(indexes[i-1] === randomIndex && indexes[i-2] === randomIndex) {
        i--;
        // rerun the loop 
      }
    }
  }

  return indexes;
}

const Game = (props: GameProps) => {

  if(!props.init) {
    return;
  }

  const NUM_ROWS = 24;
  const NUM_COLS = 10;

  const action: Ref<string> = useRef(null);
  const activePiece: Ref<ActivePiece> = useRef(null);
  const pieceQueIndexes: Ref<number[]> = useRef(null);
  const pieceQue: Ref<number[][][]> = useRef(null);
  const stats: Ref<Scoring> = useRef(null);
  const ticker: Ref<NodeJS.Timeout> = useRef(null);

  
  const columnHeights: Ref<Uint8Array> = useRef(null);
  const prevPieceCoords: Ref<Uint8Array> = useRef(null);

  // TODO: flatten array for performance
  const board: Ref<Uint8Array> = useRef(null);


  // TODO: implement a way of caching columns. getting columns everytime a drop is done is expensive

  //const boardCols: Ref<number[][]> = useRef([]);

  // const getBoardCols = (): number[][] => {
  //   if(!board.current){
  //     return [];
  //   }

  //   let cells = board.current;
  //   const boardCols: number[][] = [];
  //   for (let i = 0; i < NUM_COLS; i++) {
  //     let col: number[] = [];
  //     for (let j = 0; j < NUM_ROWS; j++) {
  //       col.push(cells[j*NUM_COLS + i]);
  //     }
  //     boardCols.push(col);
  //   }
  //   return  boardCols;
  // };

  const updatePosition = () => {
    if(!board.current || !activePiece.current) {return}

    const grid = board.current;
    const p: ActivePiece = activePiece.current;
    const perm: number[][] = p.permutation;
    // const permPrev: number[][] = p.permutationPrev;
    const h: number = p.height;
    // const hPrev: number = p.heightPrev;
    const w: number = p.width;
    // const wPrev: number = p.widthPrev;

    // let canMoveLateral = true;
    if (p.x != p.xPrev) {
      let coords = p.coords;
      let dx = p.x - p.xPrev;
      if(coords){
        // FIXME
        for(let i=0;i<coords.length; i++){
          let y = Math.floor(coords[i] / NUM_COLS);
          let x = coords[i] % NUM_COLS;
          let cellValue = grid[y * NUM_COLS + x + dx];
          if(cellValue !== 0 && cellValue < 10){
            p.x = p.xPrev;
            // console.log("can't move laterally");
          }   
        }
      }
      // canMoveLateral = false;
      // p.yPrev = p.y - 1;
    }


    let j_i = p.x;
    let i_i = p.y - 1;

    let i_s = h-1;
    
    let canMoveDown = true;

    // FIXME
    for(let i=i_i; i > (i_i - h); i--) {
      let j_s = 0;
      for(let j=j_i; j < (j_i + w); j++) {
        let cellValue: number = grid[i*NUM_COLS + j];
        if(perm[i_s][j_s] > 0 && i >= 0 && j >= 0 && cellValue !== 0 && cellValue !== perm[i_s][j_s]) {
          if(p.y !== p.yPrev){
            canMoveDown = false;
            console.log("can't move down...");
            p.y = p.yPrev;
          }
          
        }
        j_s++;
      } 
      i_s--;
    }

    // TODO: optimize
    if(canMoveDown) { 

      // erase old location
      for(let i=0; i<p.coords.length; i++){
        // board.current[p.coords[i][0]][p.coords[i][1]] = 0;
        board.current[p.coords[i]] = 0;
      }

      p.xPrev = p.x;

      // write new location
      j_i = p.x;
      i_i = p.y-1;

      let i_ss = h-1;
      let newCoords = new Uint8Array(4);
      let count = 0;
      for(let i=i_i; i > (i_i - h); i--) {
        let j_s = 0;
        for(let j=j_i; j < (j_i + w); j++) {
          if(perm[i_ss][j_s] > 0 && i >= 0 && j >= 0 && grid[i*NUM_COLS + j] === 0) {
            let cellCoord: number = i * NUM_COLS + j;
            board.current[cellCoord] = perm[i_ss][j_s];
            newCoords[count] = cellCoord;
            count++;
          }
          j_s++;
        }
        i_ss--;
      }

      // can this just be set in the loop??
      p.coords = newCoords;
      // newCoords = null;

      // board.current = rows;
    }

  }

  const updateBoard = (piece?: ActivePiece | null) => {

    if(tick.value < 0 || !board.current) {
      return;
    }

    const grid = board.current;

    if(piece) {

      if(piece.y === piece.yPrev && piece.x === piece.xPrev) {
        // for(let i=0;  i<board.current.length; i++) {
        //   for(let j=0;  j<board.current[0].length; j++) {
        //     if(board.current[i][j] > 10) {
        //       board.current[i][j] = board.current[i][j] / 11; 
        //     }
        //   }
        // }

        //
        //  Set final position of Active Piece
        //
        let coords = piece.coords;
        let colHeights = columnHeights.current;
        for(let i=0; i<TETRONIMO_SIZE; i++){
          let y = Math.floor(coords[i] / NUM_COLS);
          let x = coords[i] % NUM_COLS;
          // rows[coords[i][0]][coords[i][1]] = rows[coords[i][0]][coords[i][1]] / 11;

          grid[coords[i]] = grid[coords[i]] / 11;
          
          // update max column heights of fixed pieces;
          if(colHeights) {
            colHeights[x] = Math.max((NUM_ROWS - y), colHeights[x]);
            // console.log(colHeights.toString());
          }
        }

        activePiece.current = null; 
        requestAnimationFrame(()=>{
          updateBoard(null);
        });
        setTimeout(()=>{
          activePiece.current = getPieceFromQue();          
        }, TICK_INTERVAL);
        return;
      }

      if(piece.lastTick != tick.value){
        if(!piece.dropped){
          piece.yPrev = piece.y;
          piece.y = Math.min(piece.y + 1, piece.yMax); 
        }
        // console.log({pieceY: piece.y});
        piece.lastTick = tick.value;
        updatePosition()
      }
    }
    else  
    {
      // Method 1: clear empty rows
      // const newRows = rows.filter((row) => {
      //   if (row.includes(0)) {
      //     return true;
      //   }
      //   return false;
      // });

      let numCleared = 0;

      // Method 2: find full rows and recycle them
      let clearedRowIndexesAsc: number[] = [];
      for(let i=NUM_ROWS-1; i>=0; i--){
        let clearCurrentRow: boolean = true;
        for(let j=0; j<NUM_COLS; j++){
          if(grid[i * NUM_COLS + j] === 0 || numCleared >= 4) {
            clearCurrentRow = false;
            break;
          }
        }
        if(clearCurrentRow) {
          clearedRowIndexesAsc.unshift(i);
          numCleared++;
        } 
      }
      
      // Dear Future Self...
      // clearedRowIndexesAsc needs to (and should already) be sorted ascending
      // no need to sort this array here, but remember that is required for this splice 
      // loop to work properly

      // This should be a memory optimized operation
      // let emptyRowCache: Uint8Array = new Uint8Array(numCleared * NUM_COLS);
      if(numCleared > 0) {
        
        let colHeights = columnHeights.current;
        if(colHeights) {
          for(let i=0; i<NUM_COLS; i++) {
            colHeights[i] = Math.max(colHeights[i] - numCleared, 0);
          }
        }

        // if we have a multi-line clear where the rows are grouped togther, we do one shift
        if(numCleared - 1 === clearedRowIndexesAsc[numCleared-1] - clearedRowIndexesAsc[0]) {
          grid.copyWithin(NUM_COLS * numCleared, 0, clearedRowIndexesAsc[0]*NUM_COLS);
        }
        else {
        // if we have a double or triple line clear where the cleared lines are not all grouped togther, we do two shifts
          for(let j=0; j<numCleared; j++) {    
            if(numCleared > 1 && j < (numCleared - 1) && clearedRowIndexesAsc[j+1] - clearedRowIndexesAsc[j] === 1){
              grid.copyWithin(NUM_COLS * 2, 0, clearedRowIndexesAsc[j+1]*NUM_COLS);
              j++;
            }
            else {
              grid.copyWithin(NUM_COLS, 0, clearedRowIndexesAsc[j]*NUM_COLS);
            }
          }
        }

        // because we used copy within, to shift all of the rows down,
        // we have to overwrite the duplicated rows at the top of the board
        grid.fill(0,0,numCleared*NUM_COLS);
      
        if(stats.current && numCleared > 0) {
          stats.current.lines += numCleared;
          stats.current.level = Math.floor(stats.current.lines / 10) + 1;
          stats.current.score += ((((numCleared - 1) + numCleared)*100 + (numCleared === 4 ? 100 : 0)) * Math.ceil((stats.current.lines || 1)/10));
        }
      
        if(numCleared > 0) {
          switch(numCleared) {
            case 1:
              action.current = "Single!";
              break;
            case 2:
              action.current = "Double!";
            break;
            case 3:
              action.current = "Triple!";
              break;
            case 4:
              action.current = "TETRIS!";
              break;
          }

          props.actionCallback(action.current || "");
        }
      }
    }
  };

  const getNextPiece = () => {

    // replenish que
    if(pieceQueIndexes.current && pieceQueIndexes.current.length <= 5) {
      pieceQueIndexes.current?.push(...evenDistributionRandomIndexes(PIECE_INDEXES_QUE_LENGTH, TETRONIMOS.length-1));
    }

    let index: number = pieceQueIndexes.current?.shift() ?? -1;
    let shape: number[][] = TETRONIMOS[index];
    return JSON.parse(JSON.stringify(shape));
    // return new ActivePiece(shape, (Math.round(Math.random() * 3) + 1))
  }

  const getPieceFromQue = () => {
    pieceQue.current?.push(getNextPiece());    
    // console.log(pieceQue.current);
    return new ActivePiece(pieceQue.current?.shift(), (Math.round(Math.random() * 3) + 1));
  }

  const keydownHandler = (e:KeyboardEvent) => {
    
    props.keydownCallback(e.key);
    if(!activePiece.current || !board.current) {
      return;
    }
    switch(e.key) {
      case "ArrowRight":
        if((activePiece.current.x + activePiece.current.width) < NUM_COLS) {
          activePiece.current.xPrev = activePiece.current.x;
          activePiece.current.yPrev = activePiece.current.y - 1;
          activePiece.current.x += 1; 
          updatePosition();
        }
        break;
      case "ArrowLeft":
        if(activePiece.current.x > 0) {
          activePiece.current.xPrev = activePiece.current.x;
          // activePiece.current.yPrev = activePiece.current.y - 1;
          activePiece.current.x -= 1; 
          updatePosition();
        }
        break;
      case "ArrowDown":
        if(activePiece.current.y < 24) {
          activePiece.current.yPrev = activePiece.current.y;
          activePiece.current.y += 1;
          tick.value = tick.value + 1; // optimization?
          updatePosition();
        }
        break;

      // insta-drop the piece
      case "ArrowUp":
        // const cols: number[][] = getBoardCols();

        const p: ActivePiece = activePiece.current;

        p.dropped = true;

        let colIndex = activePiece.current.x;
        let perm: number[][] = activePiece.current.permutation;

        //
        // Gets the offsets from the bottoms contour of the piece's current permutation
        //
        let bottomOffsets: number[] = [];
        for(let i=0; i<p.width; i++) {
          bottomOffsets.push(0);
          for(let j=p.height-1; j>=0; j--) {
            if(perm[j][i] !== 0) {
              break;
            }
            bottomOffsets[i]++;
          }
        }
        
        let minDistance: number = activePiece.current.yMax - activePiece.current.y;
        // let minDistances = [];
        // let minDistances2 = [];
        for(let i=0; i<activePiece.current.width; i++) {
          // let colArr: number[] = (cols[i + colIndex]);
          let dropDistance = bottomOffsets[i];
          // for(let j=activePiece.current.y; j<colArr.length; j++){
          //   if(colArr[j] !== 0) {
          //     break;
          //   }
          //   dropDistance++;
          // }
          if(columnHeights.current){
            dropDistance += NUM_ROWS - columnHeights.current[colIndex + i] - activePiece.current.y;
            // minDistances2.push();
          }
          if(dropDistance < minDistance) {
            minDistance = dropDistance;
          }
          // minDistances.push(dropDistance);
        }


        // console.log({minDistances});
        // console.log({minDistances2});

        // console.log(JSON.stringify(bottomOffsets) + " " + JSON.stringify(minDistances));

        p.xPrev = p.x;
        activePiece.current.y += minDistance;
        activePiece.current.yPrev = activePiece.current.y;
        updatePosition();
        break;

      case "Alt":
      case "Control":
          activePiece.current.rotateLeft();
          updatePosition();
        break;
      case "Shift":
      case "Meta":
        activePiece.current.rotateRight();
          updatePosition();
        break;
    }
  }

  const initRefs = () => {
    if(!pieceQue.current){
      pieceQue.current = [];
    }
    if(!pieceQueIndexes.current){
      pieceQueIndexes.current = [];
    }
    if(!columnHeights.current) {
      columnHeights.current = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    if(!prevPieceCoords.current) {
      prevPieceCoords.current = new Uint8Array([0,0,0,0]);
    }
    if(!board.current) {
      board.current = new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ]);
    }

    if(!action.current) {
      action.current = "Action";
    }

    if(!stats.current) {
      stats.current = {
        level: 1,
        lines: 0,
        score: 0,
      }
    }
  }

  const pauseGame = () => {
    if(ticker.current){
      clearInterval(ticker.current);
      ticker.current = null;
    }
  }
  const resumeGame = () => {
    if(!ticker.current){
      ticker.current = setInterval(()=>{
        tick.value = tick.value + 1;
      },TICK_INTERVAL)
    }
  }

  useEffect(()=>{

    initRefs();

    resumeGame();
    
    pieceQueIndexes.current?.push(
      ...evenDistributionRandomIndexes(PIECE_INDEXES_QUE_LENGTH + PIECE_QUE_LENGTH, TETRONIMOS.length-1)
      );

      // console.log(pieceQueIndexes.current);

    let indices = pieceQueIndexes.current || [];
    for(let i=0; i<PIECE_QUE_LENGTH; i++) {
      pieceQue.current?.push(TETRONIMOS[
        indices[i]
      ] );
    }

    setTimeout(()=> {
      // activePiece.current = getNextPiece();
      activePiece.current = getPieceFromQue();
    },TICK_INTERVAL * (0.5 / Math.pow((stats.current?.level || 1), 2)) );
  
    document.addEventListener("keydown", keydownHandler);

    return () => {
      // null out references for GC
      pieceQue.current = null;
      pieceQueIndexes.current = null;
      activePiece.current = null;
      stats.current = null;
      board.current = null;
      action.current = null;
      columnHeights.current = null;
      prevPieceCoords.current = null;

      if(ticker.current) {
        clearInterval(ticker.current);
        ticker.current = null;
      }

      document.removeEventListener("keydown", keydownHandler);
    }
  },[]);


  // Controls the game speed by level
  useEffect(() => {

    // if(tick.value % (Math.max(80 - 10*(stats.current?.level || 1),10)/10) === 0) {
      updateBoard(activePiece.current);
    // }
    
  });

  const renderBoard = () => {
    if(!board.current){
      return
    };

    const grid = board.current;
    let rows = [];
    for(let i=0; i<NUM_ROWS; i++) {

      let rowCells = [];

      for(let j=0; j<NUM_COLS; j++) {
        const gridIndex = i * NUM_COLS + j;
        const cellValue = grid[i * NUM_COLS + j];
        // const colorEnumVal = cellValue > 10 ? colorEnum[cellValue/11] : colorEnum[cellValue]
        const colorEnumVal = cellValue > 10 ? cellValue/11 : cellValue;

        const cellColor = `gc c${colorEnumVal}`;

        rowCells[j] = (
          <>
            <div
              key={`c${gridIndex}`}
              className={`${cellColor}`}
            ></div>
          </>
        );

      }

      rows[i] = (
        <>
          <div key={`r${i}`} className="gr">
            {rowCells}
          </div>
        </>
      );
    }

    return rows;
    
    // return rows.map((row) => {
    //   return (
    //     <div className="tw-flex tw-flex-row tw-gap-0">
    //       {row.map((cellValue) => {
    //         let colorEnumVal = cellValue > 10 ? colorEnum[cellValue/11] : colorEnum[cellValue]
    //         let cellColor =
    //           cellValue === 0
    //             ? 'tw-bg-black tw-border tw-border-gray-900'
    //             : `tw-border tw-bg-${colorEnumVal} tw-border-${colorEnumVal} tw-border-outset`;
    //         return (
    //           <div
    //             className={`tw-h-4 tw-w-4 ${cellColor} tw-box-border`}
    //             style={{ borderStyle: (cellValue === 0 ? 'solid' : 'outset') }}
    //           ></div>
    //         );
    //       })}
    //     </div>
    //   );
    // });

  };

  return (
    <div className="tw-flex tw-items-center tw-justify-between tw-border-gray-100 tw-gap-4">
      
      <div className="tw-h-80 tw-w-60 tw-mt-0 tw-flex tw-flex-col gap-8 tw-p-0 tw-items-center tw-justify-center">
        <button className="tw-border-slate-200 tw-w-32 tw-m-6" onClick={()=>{
          tick.value = 0;
          stats.current = {
            score: 0,
            lines: 0,
            level: 0,
          };
          if(columnHeights.current) {
            columnHeights.current.fill(0);
          }
          if(activePiece.current) {
            // activePiece.current = getNextPiece();
            activePiece.current = getPieceFromQue();
          }
          if(!board.current) { return; }
          board.current.fill(0);
    
        }}>Restart</button>
        <button className="tw-border-slate-200 tw-w-32" onClick={()=>{
          if(ticker.current) {
            pauseGame();
          }
          else {
            resumeGame();
          }
        }}>Pause ||</button>
      </div>
      <div style={{border: "2px inset rgba(0,0,0,0.5)"}}
      className="tw-flex tw-flex-row tw-gap-2  tw-bg-slate-700 tw-bg-opacity-30 tw-rounded-xl tw-h-full tw-px-4 tw-pb-4">
        <div className="game-left-pane tw-flex tw-flex-col tw-w-20 tw-items-top tw-justify-center tw-gap-0 tw-mt-24"></div>
        <div>
          <h5 className="bg-green-100 game-clock">{Math.floor(Math.floor(tick.value / 25) / 60)}'{(Math.floor(tick.value / 25) % 60 + 100).toString().substring(1,3)}"</h5>
          <div class="container tw-pt-2 tw-h-80 tw-overflow-hidden tw-border-content">
            <div className="tw-h-96 tw-w-40 tw-bg-black tw-flex tw-flex-col tw-gap-0"  style={{transform: "translateY(-4.5rem)"}}>
              {renderBoard()}
            </div>
          </div>
        </div>
        <PieceQue queLength={PIECE_QUE_LENGTH} pieces={pieceQue.current || []}/>
      </div>
      <StatsPanel fields={[
        {
          name: "Score",
          value: stats.current?.score || 0
        },
        {
          name: "Lines",
          value: stats.current?.lines || 0
        },
        {
          name: "Level",
          value: stats.current?.level || 1
        },
      ]}></StatsPanel>
    </div>
  );
};

export default Game;

interface PieceQueProps {
  queLength: number;
  pieces?: number[][][];
}

const defaultPropsPieceQue: PieceQueProps = {
  queLength: 5,
  pieces: [
    TETRONIMOS[0],
    TETRONIMOS[1],
    TETRONIMOS[2],
    TETRONIMOS[3],
    TETRONIMOS[4],
    TETRONIMOS[5],
    TETRONIMOS[6],
  ]
}

export const PieceQue: preact.FunctionComponent<PieceQueProps> = (props: PieceQueProps) => {

  return (
    <>
      <div className="tw-flex tw-flex-col tw-w-20 tw-items-top tw-justify-center tw-gap-0 tw-mt-24">
        {
          props.pieces &&
          props.pieces.slice(0,5).map((piece: number[][])=>{
            
            return (
              <>
                <div className="tw-flex tw-flex-col tw-gap-0 tw-justify-center tw-items-center tw-h-16 tw-w-16">
                {
                  piece.map((row: number[]) => {
                    return (
                      <>
                      <div className={`tw-flex tw-flex-row tw-gap-0 tw-box-content tw-w-${row.length * 4}`}>
                        {
                          row.map((cellValue: number)=>{
                            let colorEnumVal = cellValue > 10 ? colorEnum[cellValue/11] : colorEnum[cellValue]
                            let cellColor: string =
                              cellValue === 0
                                ? 'tw-bg-transparent'
                                : `tw-border tw-bg-${colorEnumVal} tw-border-${colorEnumVal} tw-border-outset`;
                            return (
                              <>
                                <div
                                  className={`tw-h-4 tw-w-4 ${cellColor} tw-box-border`}
                                  style={{ borderStyle: (cellValue === 0 ? 'none' : 'outset') }}
                                ></div>
                              </>
                            );
                          })
                        }
                      </div>
                      </>
                    );
                  })
                }
                </div>
              </>
            );
          })
        }
      </div>
    </>
  );
}
PieceQue.defaultProps = defaultPropsPieceQue;
