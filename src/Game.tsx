/**

TODO:

Gameplay:

  1. (done) Implement GameOver State
  2. (done) Fix Collision Detection with left/right moves and rotation against set blocks
  3. (done) Implement Que (as a stack)
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
import { useRef, useEffect, useState, useReducer } from 'preact/hooks';
import { Signal, signal } from '@preact/signals';
import './app.css';
import { StatsPanel } from './StatsPanel';

const TICK_INTERVAL: number = 50;
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

  private _coords: number[][] = [];
  public set coords(value: number[][]) {
    this._coords = value;
  }
  public get coords(): number[][] {
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

  constructor(shape?: number[][], rotation?: Direction, coords?: number[][], x?: number, y?: number) {

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

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const paused = useRef(false);
  const [gameover, setGameover] = useState(false);

  const action: Ref<string> = useRef(null);
  const activePiece: Ref<ActivePiece> = useRef(null);
  const pieceQueIndexes: Ref<number[]> = useRef(null);
  const pieceQue: Ref<number[][][]> = useRef(null);
  const stats: Ref<Scoring> = useRef(null);
  const ticker: Ref<NodeJS.Timeout> = useRef(null);

  const columnHeights: Ref<Int8Array> = useRef(null);

  // TODO: flatten array for performance
  const board: Ref<number[][]> = useRef(null);


  // TODO: implement a way of caching columns. getting columns everytime a drop is done is expensive

  //const boardCols: Ref<number[][]> = useRef([]);

  const getBoardCols = (): number[][] => {
    if(!board.current){
      return [];
    }

    let rowLen = board.current[0].length;
    let cells = board.current.flat();
    let colLen = board.current.length;
    const boardCols: number[][] = [];
    for (let i = 0; i < rowLen; i++) {
      let col: number[] = [];
      for (let j = 0; j < colLen; j++) {
        col.push(cells[j * rowLen + i]);
      }
      boardCols.push(col);
    }
    return  boardCols;
  };

  const updatePosition = () => {
    if(!board.current || !activePiece.current) {return}

    const rows = board.current;
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
        for(let i=0;i<coords.length; i++){
          let y = coords[i][0];
          let x = coords[i][1];
          let cellValue = rows[y][x + dx];
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
    for(let i=i_i; i > (i_i - h); i--) {
      let j_s = 0;
      for(let j=j_i; j < (j_i + w); j++) {
        if(perm[i_s][j_s] > 0 && i >= 0 && j >= 0 && board.current[i][j] !== 0 && board.current[i][j] !== perm[i_s][j_s]) {
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
        board.current[p.coords[i][0]][p.coords[i][1]] = 0;
      }

      p.xPrev = p.x;

      // write new location
      j_i = p.x;
      i_i = p.y-1;

      let i_ss = h-1;
      let newCoords: number[][] = [];
      for(let i=i_i; i > (i_i - h); i--) {
        let j_s = 0;
        for(let j=j_i; j < (j_i + w); j++) {
          if(perm[i_ss][j_s] > 0 && i >= 0 && j >= 0 && board.current[i][j] === 0) {
            board.current[i][j] = perm[i_ss][j_s];
            newCoords.push([i,j]);
          }
          j_s++;
        }
        i_ss--;
      }

      p.coords = newCoords;

      // board.current = rows;
    }

  }

  const updateBoard = (piece?: ActivePiece | null) => {

    if(tick.value < 0 || !board.current) {
      return;
    }

    const rows = board.current;
    const nRows = rows.length;

    if(piece) {


      // set piece in place

      if(piece.y === piece.yPrev && piece.x === piece.xPrev) {
        // for(let i=0;  i<board.current.length; i++) {
        //   for(let j=0;  j<board.current[0].length; j++) {
        //     if(board.current[i][j] > 10) {
        //       board.current[i][j] = board.current[i][j] / 11; 
        //     }
        //   }
        // }

        
        let coords = piece.coords;
        let colHeights = columnHeights.current;
        for(let i=0; i<TETRONIMO_SIZE; i++){
          let y = coords[i][0];
          let x = coords[i][1];
          rows[coords[i][0]][coords[i][1]] = rows[coords[i][0]][coords[i][1]] / 11;
          if(colHeights) {
            colHeights[x] = Math.max((nRows - y), colHeights[x]);
            // console.log(colHeights.toString());
          }
        }
        
        //check for gameover//
        let numBlocksOffscreen = 0;
        for(let i=rows.length - 20; i>=0; i--) {
          numBlocksOffscreen = rows[i].reduce((prev, curr)=> prev + (curr > 0 ? 1 : 0),numBlocksOffscreen);
          if(numBlocksOffscreen >= 4) {
            setGameover(true);
            paused.current = true;
            pauseGame();
            return;
            // break;
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
      let clearedRowIndexesDesc: number[] = [];
      for(let i=nRows-1; i>=0; i--){
        let row = rows[i];
        if(!row.includes(0) && numCleared < 4){
          row.fill(0);  // overwrite (erase) the row
          clearedRowIndexesDesc.push(i);
          numCleared++;
          if(numCleared === 4) {  // TODO: cache height of last piece
            break;
          }
        }
      }
      
      // Dear Future Self...
      // clearedRowIndexesDesc needs to (and should already) be sorted descending
      // no need to sort this array here, but remember that is required for this splice 
      // loop to work properly

      // This should be a memory optimized operation
      let emptyRowCache: number[][] | null = [];
      if(emptyRowCache !== null) {
        for(let j=0; j<numCleared; j++) {
          emptyRowCache.push(
            rows.splice(clearedRowIndexesDesc[j],1)[0]
          );
        }
        for(let j=0; j<numCleared; j++) {
          rows.unshift(emptyRowCache.pop() as number[]);
        }
        emptyRowCache = null;
      }
      
      // Check for and clear full rows 
      // let nNewRows = newRows.length;

      //let numCleared = nRows - nNewRows;

      if(stats.current && numCleared > 0) {
        stats.current.lines += numCleared;
        stats.current.level = Math.floor(stats.current.lines / 10) + 1;
        stats.current.score += ((((numCleared - 1) + numCleared)*100 + (numCleared === 4 ? 100 : 0)) * Math.ceil((stats.current.lines || 1)/10));
      }

      // for (let i = 0; i < numCleared; i++) {
      //   newRows.unshift([...emptyRow]);
      // }

      // // updateRef
      // for (let i = 0; i < nRows; i++) {
      //   board.current[i] = newRows[i];
      // }

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

  const keydownHandler = (e:any) => {
    
    props.keydownCallback(e.key);
    if(!activePiece.current || !board.current || paused.current || gameover) {
      return;
    }
    switch(e.key) {
      case "ArrowRight":
        if((activePiece.current.x + activePiece.current.width) < board.current[0].length) {
          activePiece.current.xPrev = activePiece.current.x;
          activePiece.current.yPrev = activePiece.current.y - 1;
          activePiece.current.x += 1; 
          updatePosition();
        }
        break;
      case "ArrowLeft":
        if(activePiece.current.x > 0) {
          activePiece.current.xPrev = activePiece.current.x;
          activePiece.current.yPrev = activePiece.current.y - 1;
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
        const cols: number[][] = getBoardCols();

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
        let minDistances = [];
        for(let i=0; i<activePiece.current.width; i++) {
          let colArr: number[] = (cols[i + colIndex]);
          let dropDistance = bottomOffsets[i];
          for(let j=activePiece.current.y; j<colArr.length; j++){
            if(colArr[j] !== 0) {
              break;
            }
            dropDistance++;
          }
          minDistances.push(minDistance);
          if(dropDistance < minDistance) {
            minDistance = dropDistance;
          }
        }

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
      columnHeights.current = new Int8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    if(!board.current) {
      board.current = [
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
      ];
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
    paused.current = true;
    forceUpdate(1);
  }
  const resumeGame = () => {
    if(!ticker.current){
      ticker.current = setInterval(()=>{
        tick.value = tick.value + 1;
      },TICK_INTERVAL)
    }
    paused.current = false;
    forceUpdate(1);
  }

  useEffect(()=>{

    initRefs();

    setGameover(false);
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

      if(ticker.current) {
        clearInterval(ticker.current);
        ticker.current = null;
      }

      document.removeEventListener("keydown", keydownHandler);
    }
  },[]);


  // Controls the game speed by level
  useEffect(() => {

    if(tick.value % (Math.max(80 - 10*(stats.current?.level || 1),10)/10) === 0) {
      updateBoard(activePiece.current);
    }
    
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
                ? 'tw-bg-black tw-border tw-border-gray-900'
                : `tw-border tw-bg-${colorEnumVal} tw-border-${colorEnumVal} tw-border-outset`;
            return (
              <div
                className={`tw-h-4 tw-w-4 ${cellColor} tw-box-border`}
                style={{ borderStyle: (cellValue === 0 ? 'solid' : 'outset') }}
              ></div>
            );
          })}
        </div>
      );
    });

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
          if(activePiece.current) {
            // activePiece.current = getNextPiece();
            activePiece.current = getPieceFromQue();
          }
          if(!board.current) { return; }
          for(let i=0;  i<board.current.length; i++) {
            for(let j=0;  j<board.current[0].length; j++) {
              board.current[i][j] = 0; 
            }
          }
          setGameover(false);
          resumeGame();
        }}>Restart</button>
        <button className="tw-border-slate-200 tw-w-32" disabled={gameover} onClick={()=>{
          if(!paused.current) {
            pauseGame();
          }
          else {
            resumeGame();
          }
        }}>{paused.current ? 'Resume' : 'Pause'}</button>

        <ControlsMap clickCallback={(e)=>{ keydownHandler(e)}}/>
      </div>
      <div style={{border: "2px inset rgba(0,0,0,0.5)"}}
      className="tw-flex tw-flex-row tw-gap-2  tw-bg-slate-700 tw-bg-opacity-30 tw-rounded-xl tw-h-full tw-px-4 tw-pb-4">
        <div className="game-left-pane tw-flex tw-flex-col tw-w-20 tw-items-top tw-justify-center tw-gap-0 tw-mt-24"></div>
        <div>
          <h5 className="bg-green-100 game-clock">{Math.floor(Math.floor(tick.value / 20) / 60)}'{(Math.floor(tick.value / 25) % 60 + 100).toString().substring(1,3)}"</h5>
          <div class="container tw-pt-2 tw-h-80 tw-overflow-hidden tw-border-content tw-relative">
            
            <div className="tw-h-96 tw-w-40 tw-bg-black tw-flex tw-flex-col tw-gap-0"  style={{transform: "translateY(-4.5rem)"}}>
              {renderBoard()}
            </div>
            { (gameover || paused.current) &&
              <div className="tw-flex tw-items-center tw-justify-center tw-absolute tw-w-40 tw-h-80 tw-bg-black tw-bg-opacity-50 tw-z-10 tw-top-0 tw-left-0">
                <h2 className="tw-text-center">{gameover ? 'Game Over' : 'Paused'}</h2>
              </div>
            }
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


interface ControlsMapProps {
  clickCallback?: (e:any) => void;
  keyMoveLeft?: string;
  keyMoveRight?: string;
  keyMoveDown?: string;
  keyDropPiece?: string;
  keyRotateLeft?: string;
  keyRotateRight?: string;
  keyStashPiece?: string;
}

const DEFAULT_KEY_MAP: ControlsMapProps = {
  keyMoveLeft: 'ArrowLeft',
  keyMoveRight: 'ArrowRight',
  keyMoveDown: 'ArrowDown',
  keyDropPiece: 'ArrowUp',
  keyRotateRight: 'Shift',
  keyRotateLeft: 'Alt',
  keyStashPiece: '/'
}

const KEY_CODE_MAP: any = {
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'Control': '^',
  'Shift': '⬆',
  'Alt': '⎇',
}
export const ControlsMap: preact.FunctionComponent<ControlsMapProps> = (props: ControlsMapProps) => {

  return (
    <>
      <div className="game-control-map tw-flex tw-gap-4 tw-flex-col tw-justify-center tw-items-center tw-mt-12 tw-rounded-lg tw-px-2 tw-py-2">

        <div className="tw-flex tw-gap-12 tw-flex-row tw-justify-center tw-items-center">
          <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text tw-flex tw-flex-col gap-0" 
          onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyRotateLeft})}}}
          style={{fontSize: '1.2rem'}}><>↺</>
            <span class="tooltip-text top tw-flex-none tw-p-0">{props.keyRotateLeft} ({props.keyRotateLeft ? KEY_CODE_MAP[props.keyRotateLeft] : props.keyRotateLeft})</span>
          </div>
          {/* <div className="tw-bg-gray-900 tw-rounded-md tw-shadow-inner tw-shadow-slate-400 tw-w-8 tw-h-8 hover-text"><>{KEY_CODE_MAP[props.keyDropPiece]}</>
            <span class="tooltip-text top tw-flex-none tw-p-0">Drop Piece</span>
          </div> */}
          <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text tw-flex tw-flex-col gap-0" 
          onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyRotateRight})}}}
          style={{fontSize: '1.2rem'}}>
            <>
            ↻
            </>
            <span class="tooltip-text top tw-flex-none tw-p-0">{props.keyRotateRight} ({props.keyRotateRight ? KEY_CODE_MAP[props.keyRotateRight] : props.keyRotateRight})</span>
          </div>
        </div>
        <div className="tw-flex tw-gap-2 tw-flex-row tw-justify-center tw-items-center">
          <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text"
            onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyMoveLeft})}}}>
            <>{props?.keyMoveLeft && (KEY_CODE_MAP[props.keyMoveLeft] || props.keyMoveLeft)}</>
          <span class="tooltip-text bottom tw-flex-none tw-p-0">Move Left ({props?.keyMoveLeft && (KEY_CODE_MAP[props.keyMoveLeft] || props.keyMoveLeft)})</span>
          </div>
          <div className="tw-flex tw-gap-2 tw-flex-col tw-justify-center tw-items-center">
            <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text tw-flex tw-flex-col gap-0"
            onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyDropPiece})}}}>
              <>
                {props?.keyDropPiece && (KEY_CODE_MAP[props.keyDropPiece] || props.keyDropPiece)}
                <div className="tw-text-xs tw-p-0 tw-m-0" style={{marginTop: "-8px",fontSize: '0.5rem'}}>Drop</div>
              </>
              <span class="tooltip-text top tw-flex-none tw-p-0">Drop Piece ({props?.keyDropPiece && (KEY_CODE_MAP[props.keyDropPiece] || props.keyDropPiece)})</span>
            </div>
            <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text"
              onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyMoveDown})}}}>
              <>{props?.keyMoveDown && (KEY_CODE_MAP[props.keyMoveDown] || props.keyMoveDown)}</>
              <span class="tooltip-text bottom tw-flex-none tw-p-0">Move Down ({props?.keyMoveDown && (KEY_CODE_MAP[props.keyMoveDown] || props.keyMoveDown)})</span>
            </div>
          </div>
          <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text"
            onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyMoveRight})}}}>
            <>{props?.keyMoveRight && (KEY_CODE_MAP[props.keyMoveRight] || props.keyMoveRight)}</>
            <span class="tooltip-text bottom tw-flex-none tw-p-0">Move Right ({props?.keyMoveRight && (KEY_CODE_MAP[props.keyMoveRight] || props.keyMoveRight)})</span>
            </div>
        </div>
      </div>
    </>
  );
};
ControlsMap.defaultProps = {
  keyRotateLeft: DEFAULT_KEY_MAP.keyRotateLeft,
  keyRotateRight: DEFAULT_KEY_MAP.keyRotateRight,
  keyMoveDown: DEFAULT_KEY_MAP.keyMoveDown,
  keyMoveLeft: DEFAULT_KEY_MAP.keyMoveLeft,
  keyMoveRight: DEFAULT_KEY_MAP.keyMoveRight,
  keyDropPiece: DEFAULT_KEY_MAP.keyDropPiece,
  keyStashPiece: DEFAULT_KEY_MAP.keyStashPiece
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
};
PieceQue.defaultProps = defaultPropsPieceQue;
