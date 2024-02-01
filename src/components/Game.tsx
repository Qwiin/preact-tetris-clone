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
import '../app.css';
import { StatsPanel } from './StatsPanel';
import { ActionType, ShapeColors, TETRONIMOS } from '../TetrisConfig';
import { PieceQue } from './PieceQue';
import ActivePiece from '../ActivePiece';
import ControlsMap from './ControlsMap';

const TICK_INTERVAL: number = 50;
const PIECE_QUE_LENGTH: number = 6;
const PIECE_INDEXES_QUE_LENGTH: number = 40;
// const LINE_CLEAR_TIMEOUT: number = 1000;

const tick: Signal<number> = signal(0);

// const actionSignal: Signal<string> = signal("action");

interface GameProps {
  numColumns?: number;
  numRows?: number;
  init: boolean;
  keydownCallback: (key: string) => void;
  actionCallback: (value: any) => void;
  setPieceCallback?: (value: any) => void;
  setStatsCallback?: (value: any) => void;
}

interface Scoring {
  score: number;
  lines: number;
  level: number;
}

export interface PieceQueItem {
  piece: number[][];
  id: string;
}

/**
 * 
 * @param count - number of indexes to generate
 * @param maxIndex - largest value
 * @param minIndex - smallest value
 * @returns 
 */
function evenDistributionRandomIndexes(count: number, maxIndex: number, minIndex: number = 0): number[] {
  const indexes: number[] = [];

  for (let i = 0; i < count; i++) {
    
    const randomIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1));    

    if(i > 2) {
      if(indexes[i-1] === randomIndex && indexes[i-2] === randomIndex) {
        i--;
        continue;
        // rerun the loop 
      }
    }
    indexes.push(randomIndex);
  }

  return indexes;
}


const Game = (props: GameProps) => {

  if(!props.init) {
    return;
  }

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // const lineClearAnimating: Ref<boolean >= useRef(true);
  const paused = useRef(false);
  const gameoverRef = useRef(false);
  const [gameover, setGameover] = useState(false);

  const action: Ref<string> = useRef(null);
  const activePiece: Ref<ActivePiece> = useRef(null);
  const pieceQueIndexes: Ref<number[]> = useRef(null);
  const pieceQue: Ref<PieceQueItem[]> = useRef(null);
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
    let perm: number[][] = p.permutation;
    // const permPrev: number[][] = p.permutationPrev;
    let h: number = p.height;
    // const hPrev: number = p.heightPrev;
    let w: number = p.width;
    // const wPrev: number = p.widthPrev;


    // let canMoveLateral = true;
    if (p.rotation !== p.rotationPrev) {
      // let coords = p.coords;
      // let dx = p.x - p.xPrev;
      // let dy = p.y - p.yPrev;
      // let canRotateInPlace = true;
      // let canTSpin = true;
      // if(coords){
      //   for(let i=0;i<coords.length; i++){
      //     let y = coords[i][0];
      //     let x = coords[i][1];
      //     let cellValue = rows[y][x + dx];
      //     if(cellValue !== 0 && cellValue < 10){
      //       canRotateInPlace = false;
      //       // p.x = p.xPrev;
      //       // console.log("can't move laterally");
      //     }
      //     let cellValue2 = rows[y+dy][x + dx];
      //     if(cellValue2 !== 0 && cellValue2 < 10){
      //       canTSpin = false;
      //       // p.x = p.xPrev;
      //       // console.log("can't move laterally");
      //     }  
      //   }
      //   if(canRotateInPlace) {
      //     console.log("rotate in place");
      //     p.coords = [...p.coordsPrev];
      //   }
      //   else if(!canRotateInPlace && !canTSpin) {
      //     p.x = p.xPrev
      //     console.log("can't rotate nor t-spin");
      //     p.coords = [...p.coordsPrev];
      //   }
      //   else if(!canRotateInPlace && canTSpin) {
      //     console.log("can t-spin");
      //     p.xPrev = p.x;
      //     p.y += 1;
      //     p.yPrev = p.y - 1;
      //   }
      // }

      let j_iii = p.x;
      let i_iii = p.y - 1;

      let i_sss = h-1;
      

      // let dx = p.x - p.xPrev;
      let dy = p.y - p.yPrev;

      let canRotateInPlace = true;
      let canTSpin = true;
      let canTSpinLeft = true;
      let canTSpinRight = true;
      // let canMoveDown = true;
      for(let i=i_iii; i > (i_iii - h); i--) {
        let j_sss = 0;
        for(let j=j_iii; j < (j_iii + w); j++) {
          if(perm[i_sss][j_sss] > 0 && i >= 0 && j >= 0 && board.current[i][j] !== 0 && board.current[i][j] !== perm[i_sss][j_sss]) {
            // if(p.y !== p.yPrev){
            //   canMoveDown = false;
            //   console.log("can't move down...");
            //   p.y = p.yPrev;
            // }
            canRotateInPlace = false;
          }
          if(i+dy >= p.yMax){
            canTSpin = false;
            canTSpinLeft = false;
            canTSpinRight = false;
          }
          else {
            if(perm[i_sss][j_sss] > 0 && (i+dy) >= 0 && (j) >= 0 && board.current[i+dy][j] !== 0 && board.current[i+dy][j] !== perm[i_sss][j_sss]) {
              // if(p.y !== p.yPrev){
              //   canMoveDown = false;
              //   console.log("can't move down...");
              //   p.y = p.yPrev;
              // }
              canTSpin = false;
            }
            if(j === 0 || (perm[i_sss][j_sss] > 0 && (i+dy) >= 0 && (j-1) >= 0 && board.current[i+dy][j-1] !== 0 && board.current[i+dy][j-1] !== perm[i_sss][j_sss])) {
              canTSpinLeft = false;
            }
            if(j === (p.xMax-2) || (perm[i_sss][j_sss] > 0 && (i+dy) >= 0 && (j+1) >= 0 && board.current[i+dy][j+1] !== 0 && board.current[i+dy][j+1] !== perm[i_sss][j_sss])) {
              canTSpinRight = false;
            }
          }
          j_sss++;
        } 
        i_sss--;
      }
      if(canRotateInPlace) {
        console.log("rotate in place");
        // p.coords = [...p.coordsPrev];
        // p.xPrev = p.x;
        p.rotationPrev = p.rotation;
      }
      else if(!canRotateInPlace && !(canTSpin || canTSpinLeft || canTSpinRight)) {
        p.x = p.xPrev;
        p.yPrev = p.y - 1;
        console.log("can't rotate nor t-spin");
        // p.coords = [...p.coordsPrev];
        if(p.rotation > p.rotationPrev || (p.rotation === 1 && p.rotationPrev === 4)) {
          p.rotateLeft();
        }
        else if(p.rotation < p.rotationPrev || (p.rotation === 4 && p.rotationPrev === 1)) {
          p.rotateRight();
        }
        // p.rotation = p.rotationPrev;
        perm = p.permutation;
        w = p.width;
        h = p.height;
      }
      else if(!canRotateInPlace && (canTSpin || canTSpinLeft || canTSpinRight)) {
        console.log("can t-spin");
        if(canTSpinLeft) {
          p.x = p.x - 1;
          p.xPrev = p.x;
        }
        else if(canTSpinRight) {
          p.x = p.x + 1;
          p.xPrev = p.x;
        }
        else {
          p.xPrev = p.x;
        }
        p.y += 1;
        p.yPrev = p.y - 1;
        p.rotationPrev = p.rotation;
      }

      // canMoveLateral = false;
      // p.yPrev = p.y - 1;
    }

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
      if(p.x !== p.xPrev){
        p.yPrev = p.y - 1;
      }
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

      p.coordsPrev = p.coords;
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
        for(let i=0; i<coords.length; i++){
          let y = coords[i][0];
          let x = coords[i][1];
          let newCellVal = rows[coords[i][0]][coords[i][1]] / 11;
          rows[coords[i][0]][coords[i][1]] = newCellVal;
          if(colHeights) {
            colHeights[x] = Math.max((nRows - y), colHeights[x]);
            // console.log(colHeights.toString());
          }

          //check for gameover//
          if(newCellVal > 0 && newCellVal < 0.9) {
            gameOver();
            return;
          }
        }
        
        //check for gameover//
        let numBlocksOffscreen = 0;
        for(let i=rows.length - 20; i>=0; i--) {
          numBlocksOffscreen = rows[i].reduce((prev, curr)=> prev + (curr > 0 ? 1 : 0),numBlocksOffscreen);
          if(numBlocksOffscreen >= 4) {
            gameOver();
            return;
            // break;
          }
        }

        activePiece.current = null; 
        requestAnimationFrame(()=>{
          updatePosition();
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

      let points: number = 0;
      if(stats.current && numCleared > 0) {
        stats.current.lines += numCleared;
        let level: number = Math.floor(stats.current.lines / 10) + 1;
        if(stats.current.level !== level){
          stats.current.level = level;
          props.actionCallback({type: ActionType.LEVEL_UP});  
        }
        points = ((((numCleared - 1) + numCleared)*100 + (numCleared === 4 ? 100 : 0)) * Math.ceil((stats.current.lines || 1)/10));
        stats.current.score += points;
      }

      // for (let i = 0; i < numCleared; i++) {
      //   newRows.unshift([...emptyRow]);
      // }

      // // updateRef
      // for (let i = 0; i < nRows; i++) {
      //   board.current[i] = newRows[i];
      // }

      if(numCleared > 0) {
        let actionEnum = numCleared;
        switch(numCleared) {
          case 1:
            action.current = "Line Clear!";
            break;
          case 2:
            action.current = "Double Clear!";
          break;
          case 3:
            action.current = "Triple Clear!";
            break;
          case 4:
            action.current = "T E T R I S !";
            break;
        }

        props.actionCallback({type: actionEnum, text: action.current, points: points} || null);


      }
    }
  };

  const getNextPiece = (): PieceQueItem => {

    // replenish que
    if(pieceQueIndexes.current && pieceQueIndexes.current.length <= 5) {
      pieceQueIndexes.current?.push(...evenDistributionRandomIndexes(PIECE_INDEXES_QUE_LENGTH, TETRONIMOS.length-1));
    }

    let index: number = pieceQueIndexes.current?.shift() ?? -1;
    let shape: number[][] = TETRONIMOS[index];
    return {
      piece: JSON.parse(JSON.stringify(shape)),
      id: Math.round(window.performance.now()).toString()
    }
    // return new ActivePiece(shape, (Math.round(Math.random() * 3) + 1))
  }

  const getPieceFromQue = () => {
    if(pieceQue.current){
    pieceQue.current.push(getNextPiece());    
    // console.log(pieceQue.current);
    let newPiece = pieceQue.current.shift();
    let p: ActivePiece = new ActivePiece(newPiece, (Math.round(Math.random() * 3) + 1));
    let c: number[][] = [];
    for(let i=0; i<p.height; i++) {
      for(let j=0; j<p.width; j++) {
        c.push([p.y-i,p.x+j]);
      }
    }
    p.coords = c;
    return p;
    }
    return null;
  }

  const keydownHandler = (e:any) => {
    
    if(e.key === "Escape" && gameover === false) {
      if(!paused.current) {
        pauseGame();
        forceUpdate(1);
      }
      else {
        resumeGame();
      }
    }

    if(!activePiece.current || !board.current || paused.current || gameover || !ticker.current) {
      return;
    }
    // props.keydownCallback(e.key);

    switch(e.key) {
      
      case "ArrowRight":
        if(!activePiece.current.dropped && (activePiece.current.x + activePiece.current.width) < board.current[0].length) {
          
          // sfx_movePiece();

          props.keydownCallback(e.key);
          activePiece.current.xPrev = activePiece.current.x;
          activePiece.current.yPrev = activePiece.current.y - 1;
          activePiece.current.x += 1; 
          updatePosition();      
        }
        break;
      case "ArrowLeft":
        if(!activePiece.current.dropped && activePiece.current.x > 0) {
          props.keydownCallback(e.key);
          // sfx_movePiece();
          activePiece.current.xPrev = activePiece.current.x;
          activePiece.current.yPrev = activePiece.current.y - 1;
          activePiece.current.x -= 1; 
          updatePosition();
        }
        break;
      case "ArrowDown":
        if(!activePiece.current.dropped && activePiece.current.y < 24) {
          props.keydownCallback(e.key);
          // sfx_movePiece();
          activePiece.current.yPrev = activePiece.current.y;
          activePiece.current.y += 1;
          tick.value = tick.value + 1; // optimization?
          updatePosition();
        }
        break;

      // insta-drop the piece
      case "ArrowUp":
        
        const p: ActivePiece = activePiece.current;
        
        if(p.dropped) {
          return;
        }

        p.dropped = true;
        
        const cols: number[][] = getBoardCols();
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
        props.keydownCallback(e.key);

        p.xPrev = p.x;
        activePiece.current.y += minDistance;
        activePiece.current.yPrev = activePiece.current.y;
        updatePosition();
        break;

      case "Alt":
      case "Control":
        activePiece.current.rotateLeft();
        props.keydownCallback(e.key);
        updatePosition();
        break;
      case "Shift":
        activePiece.current.rotateRight();
        props.keydownCallback(e.key);
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

  const gameOver = () => {
    setGameover(true);
    gameoverRef.current = true;
    paused.current = true;
    pauseGame();
    props.actionCallback({type: ActionType.GAME_OVER});
  }

  const pauseGame = () => {
    if(ticker.current){
      clearInterval(ticker.current);
      ticker.current = null;
    }
    paused.current = true;
    // forceUpdate(1);
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
    gameoverRef.current = false;
    resumeGame();
    
    pieceQueIndexes.current?.push(
      ...evenDistributionRandomIndexes(PIECE_INDEXES_QUE_LENGTH + PIECE_QUE_LENGTH, TETRONIMOS.length-1)
      );

      // console.log(pieceQueIndexes.current);

    let indices = pieceQueIndexes.current || [];
    for(let i=0; i<PIECE_QUE_LENGTH; i++) {
      pieceQue.current?.push({
        piece: TETRONIMOS[indices[i]],
        id: Math.round(window.performance.now() * 1000 - PIECE_QUE_LENGTH + i).toString()
      });
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
        <div className="tw-flex tw-flex-row tw-gap-0 tw-box-border">
          
          { 
            row.map((cellValue) => {
            let ShapeColorsVal = cellValue > 10 ? ShapeColors[cellValue/11] : ShapeColors[cellValue]
            let cellColor =
              cellValue === 0
                ? 'tw-bg-black tw-border tw-border-gray-900'
                : `tw-border tw-bg-${ShapeColorsVal} tw-border-${ShapeColorsVal} tw-border-outset`;
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
    <div className="tw-flex tw-items-center tw-justify-between tw-border-gray-100 tw-gap-0">
      
      <div className="tw-h-80 tw-w-60 tw-mt-0 tw-flex tw-flex-col gap-8 tw-p-0 tw-items-center tw-justify-center tw-pb-6">
        <button className="tetris-font tw-border-slate-200 tw-w-32 tw-m-6 tw-p-2 tw-text-md" 
          style={{paddingTop:"0.7rem"}}
          onClick={()=>{
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
          gameoverRef.current = false;
          resumeGame();
        }} disabled={
          paused.current === false && gameover === false
          }>Restart</button>
        <button 
          className={`tetris-font menu-button tw-border-slate-200 tw-w-32 tw-p-2 tw-text-md ${gameover ? 'disabled' : ''}`} 
          style={{paddingTop:"0.7rem"}}
          disabled={gameover} 
          onClick={()=>{
          if(!paused.current) {
            pauseGame();
            forceUpdate(1);
          }
          else {
            resumeGame();
          }
        }}>{paused.current ? 'Resume' : 'Pause'}</button>

        <ControlsMap clickCallback={(e)=>{ keydownHandler(e)}}/>
      </div>
      <div style={{border: "2px inset rgba(0,0,0,0.5)"}}
      className="tw-flex tw-flex-row tw-gap-2  tw-bg-slate-700 tw-bg-opacity-30 tw-rounded-xl tw-h-full tw-pl-4 tw-pb-4">
        <div className="game-left-pane tw-flex tw-flex-col tw-w-20 tw-items-top tw-justify-center tw-gap-0 tw-mt-24"></div>
        <div>
          <h5 className="bg-green-100 game-clock tetris-font tw-text-lg">{Math.floor(Math.floor(tick.value / 20) / 60)}'{(Math.floor(tick.value / 25) % 60 + 100).toString().substring(1,3)}"</h5>
          <div class="tw-pt-0 tw-h-80 tw-overflow-hidden tw-border-content tw-relative" style={{border:"0.6px solid rgba(200,200,200,1)"}}>
            
            <div className="tw-h-96 tw-w-40 tw-bg-black tw-flex tw-flex-col tw-gap-0 tw-border-content"  style={{transform: "translateY(-4.0rem)"}}>
              {renderBoard()}
            </div>
            { (gameover || paused.current) &&
              <div className="tw-flex tw-items-center tw-justify-center tw-absolute tw-w-40 tw-h-80 tw-bg-black tw-bg-opacity-70  tw-z-10 tw-top-0 tw-left-0">
                <h2 className="tw-text-center tetris-font tw-text-lg">{gameover ? 'Game Over' : 'Paused'}</h2>
              </div>
            }
          </div>
        </div>
        {pieceQue.current &&
        <PieceQue title={"NEXT"} queLength={PIECE_QUE_LENGTH} 
        pieces={
          pieceQue?.current || [{id: "123", piece: [[]]},{id: "1", piece: [[]]},{id: "12", piece: [[]]},{id: "124", piece: [[]]},{id: "125", piece: [[]]}]
            // ? [{piece: activePiece?.current?.shape || TETRONIMOS[1], id: window.performance.now().toString()}, ...pieceQue?.current] 
            // : [{piece: TETRONIMOS[1], id:"11"}]
        
        }/>
      }
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
