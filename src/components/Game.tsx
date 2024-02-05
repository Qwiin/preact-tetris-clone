/**

TODO:

Gameplay:

  1. (done) Implement GameOver State
  2. (done) Fix Collision Detection with left/right moves and rotation against set blocks
  3. (done) Implement Que (as a stack)
  4. (done) Balance the distribution of pieces (native RNG does not feel like Tetris, lol)
    a. There should be a more normal distribution considering a game to 100 lines is only 250-300 pieces

UI/UX:
  
  1. Styleize UI
  2. (done) Add Sound
  3. (done) Break this out into multiple components

Performance:

  1. Use 1D array for gameboard
  2. Move Model into it's own class to decouple game logic from view
  3. 

**/

import { Signal, signal } from '@preact/signals';

import { Ref } from 'preact';
import { useEffect, useReducer, useRef, useState } from 'preact/hooks';
import ActivePiece, { MovementTrigger } from '../ActivePiece';
import { ActionType, Direction, GAME_SPEEDS, ShapeColors, TetronimoShape } from '../TetrisConfig';
import '../app.css';
import ControlsMap from './ControlsMap';
import { PieceQue } from './PieceQue';
import { StatsPanel } from './StatsPanel';
import {motion} from 'framer-motion';

const TICK_INTERVAL: number = 50;
const PIECE_QUE_LENGTH: number = 5;
// const LINE_CLEAR_TIMEOUT: number = 1000;

const tick: Signal<number> = signal(0);

// const actionSignal: Signal<string> = signal("action");

interface GameProps {
  numColumns?: number;
  numRows?: number;
  init: boolean;
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
  shapeEnum: TetronimoShape;
  id: string;
}

/**
 * The algo will not repeat 
 * @param bagSize - the range; i.e. number of distinct values
 * @param numBags - number of bags to use in a distribution
 * @param numDistributions - number of distributions to grab
 * @param prevDist - when grabbing more indices, 
 *        pass in the current que to make sure no repeats
 * @returns number[] of length `bagSize * numBags * numDistributions`
 */
function randomBagDistribution(bagSize: number=7, numBags: number=2, numDistributions: number=3, prevDist?: number[]){
  const bag: number[] = [];
  const dist: number[] = [];

  for(let j=0; j<numBags; j++) {
    for(let i=0; i<bagSize; i++) {
      bag.push(i);
    }
  }

  for(let k=0; k<numDistributions; k++) {
    let _bag = [...bag];
    while(_bag.length > 0) {

      let index = Math.round(Math.random() * (_bag.length-1));

      if(dist.length > 1 
        && dist[dist.length - 1] === index 
        && dist[dist.length - 2] === index) 
      {
        continue;
      }
      else if(dist.length === 1 && prevDist && prevDist.length > 0) {
        if(dist[0] === index && prevDist[prevDist.length - 1] === index) {
          continue;
        }
      }
      else if(dist.length === 0 && prevDist && prevDist.length > 1) {
        if(prevDist[prevDist.length - 1] === index && prevDist[prevDist.length - 2] === index) {
          continue;
        }
      }
      
      dist.push(_bag.splice(index,1)[0]);
    }
  }

  // console.log(dist);
  return dist;
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

  const ticker: Ref<NodeJS.Timeout> = useRef(null);
  
  const clearedRows: Ref<number[]> = useRef(null);
  const clearEffectData: Ref<any> = useRef(null);
  const dropEffectData: Ref<any> = useRef(null);

  const activePiece: Ref<ActivePiece> = useRef(null);
  const pieceQueIndexes: Ref<number[]> = useRef(null);
  const pieceQue: Ref<PieceQueItem[]> = useRef(null);
  const holdQue: Ref<PieceQueItem[]> = useRef([{id:"-1",shapeEnum: TetronimoShape.NULL}]);

  const action: Ref<string> = useRef(null);
  const stats: Ref<Scoring> = useRef(null);
  
  const downArrowPressed = useRef(false);
  const upArrowPressed = useRef(false);
  const isTSpin: Ref<boolean> = useRef(null);
  const isTSpinMini: Ref<boolean> = useRef(null);
  const tSpun = useRef(false);

  const board: Ref<number[][]> = useRef(null);
  const columnHeights: Ref<Int8Array> = useRef(null);

  // TODO: implement a way of caching columns. getting columns everytime a drop is done is expensive
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
    let h: number = p.height;
    let w: number = p.width;
    
    let rotationAttempted = false;
    let failedRotation = false;

    // let canMoveLateral = true;
    if (p.rotation !== p.rotationPrev) {
      rotationAttempted = true;
    
      let j_iii = p.x;
      let i_iii = p.y - 1;
      let i_sss = h-1;
      
      // let dx = p.x - p.xPrev;
      let dy = p.y - p.yPrev;

      let rotatedClockwise = (p.rotation - p.rotationPrev === 1 || p.rotation - p.rotationPrev === -3);

      let canRotateInPlace = true;
      let canTSpin = true;
      let canTSpinLeft = rotatedClockwise;
      let canTSpinRight = !rotatedClockwise;

      // let canMoveDown = true;
      for(let i=i_iii; i > (i_iii - h); i--) {
        let j_sss = 0;
        for(let j=j_iii; j < (j_iii + w); j++) {
          if(canRotateInPlace && perm[i_sss][j_sss] > 0 && i >= 0 && j >= 0 && rows[i][j] !== 0 && rows[i][j] !== perm[i_sss][j_sss]) {
            // if(p.y !== p.yPrev){
            //   canMoveDown = false;
            //   console.log("can't move down...");
            //   p.y = p.yPrev;
            // }
            canRotateInPlace = false;
            // canTSpinInPlace = false;
          }
          if(i+dy >= p.yMax){
            canTSpin = false;
            canTSpinLeft = false;
            canTSpinRight = false;
          }
          else {
            if(canTSpin && perm[i_sss][j_sss] > 0 && (i+dy) >= 0 && (j) >= 0 && rows[i+dy][j] !== 0 && rows[i+dy][j] !== perm[i_sss][j_sss]) {
              // if(p.y !== p.yPrev){
              //   canMoveDown = false;
              //   console.log("can't move down...");
              //   p.y = p.yPrev;
              // }
              canTSpin = false;
            }
            if(canTSpinLeft) {
              if(j === 0 || (perm[i_sss][j_sss] > 0 && (i+dy) >= 0 && (j-1) >= 0 && rows[i+dy][j-1] !== 0 && rows[i+dy][j-1] !== perm[i_sss][j_sss])) {
                canTSpinLeft = false;
              }
            }
            if(canTSpinRight && j === (p.xMax-2) || (perm[i_sss][j_sss] > 0 && (i+dy) >= 0 && (j+1) >= 0 && rows[i+dy][j+1] !== 0 && rows[i+dy][j+1] !== perm[i_sss][j_sss])) {
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
        p.xPrev = p.x;
        p.rotationPrev = p.rotation;

        if(p.shapeEnum === TetronimoShape.T) {
          tSpun.current = true;
        }
      }
      else if(!canRotateInPlace && !(canTSpin || canTSpinLeft || canTSpinRight)) {
        p.x = p.xPrev;

        // cache rotation, because rotateLeft/Right() will modify prevRotation
        let prevRotation = p.rotationPrev;
        console.log("can't rotate nor t-spin");
        // p.coords = [...p.coordsPrev];
        if(p.rotation > p.rotationPrev || (p.rotation === 1 && p.rotationPrev === 4)) {
          p.rotateLeft();
        }
        else if(p.rotation < p.rotationPrev || (p.rotation === 4 && p.rotationPrev === 1)) {
          p.rotateRight();
        }
        tSpun.current = false;
        p.rotationPrev = prevRotation;
        p.lastMoveTrigger = MovementTrigger.GRAVITY;
        failedRotation = true;
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

        if(p.shapeEnum === TetronimoShape.T) {
          tSpun.current = true;
        }
      }

      // make sure local values are updated
      perm = p.permutation;
      w = p.width;
      h = p.height;
    }

    if (p.x !== p.xPrev) {
      tSpun.current = false;
      let coords = p.coords;
      let dx = p.x - p.xPrev;
      if(coords){
        for(let i=0;i<coords.length; i++){
          let y = coords[i][0];
          let x = coords[i][1];
          let cellValue = rows[y][x + dx];
          if(cellValue !== 0 && cellValue < 10){
            p.x = p.xPrev;
          }   
        }
      }
      if(p.x !== p.xPrev){
        p.yPrev = p.y - 1;
      }
    }

    if(!failedRotation && rotationAttempted) {
      props.actionCallback({type: ActionType.ROTATE});
    }

    let j_i = p.x;
    let i_i = p.y - 1;

    let i_s = h-1;
    
    let canMoveDown = true;
    let canMoveDownTwice = true;
    if(p.y === p.yPrev && p.lastMoveTrigger !== MovementTrigger.INPUT_DROP){
      canMoveDown = false;
      canMoveDownTwice = false;
    }
    else {
      for(let i=i_i; i > (i_i - h); i--) {
        let j_s = 0;
        for(let j=j_i; j < (j_i + w); j++) {
          if(perm[i_s][j_s] > 0 && i >= 0 && j >= 0 && rows[i][j] !== 0 && rows[i][j] !== perm[i_s][j_s]) {
            canMoveDown = false;
            p.y = p.yPrev;
          }
          if(i >= rows.length-1) {
            canMoveDownTwice = false;
          }
          else if(perm[i_s][j_s] > 0 && i+1 >= 0 && i<23 && j >= 0 && rows[i+1][j] !== 0 && rows[i+1][j] !== perm[i_s][j_s]) {            
            canMoveDownTwice = false;
          }
          j_s++;
        } 
        i_s--;
      }
    }

    if(canMoveDown) { 
      if(canMoveDownTwice){
        tSpun.current = false;
      } else {
        if(failedRotation) {
          p.yPrev = p.y;
        }
      }
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

      // this is run before the render, so we need to know if the piece will thud on next paint
      if(
        (p.lastMoveTrigger === MovementTrigger.GRAVITY || p.lastMoveTrigger === MovementTrigger.INPUT_DOWN) && !canMoveDownTwice && !failedRotation) {
        console.log("can't move down twice...");
        props.actionCallback({type: ActionType.THUD});
      }
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
      if((piece.y === piece.yPrev && piece.x === piece.xPrev) || piece.lastMoveTrigger === MovementTrigger.INPUT_DROP) {
        
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
        
        // Verify and complete T-SPIN
        if(piece.shapeEnum === TetronimoShape.T && tSpun.current === true) {
            let iMin = (piece.y - piece.height) + ((piece.rotation === Direction.S) ? (-1) : 0);
            let iMax = (piece.y - 1) + ((piece.rotation === Direction.N) ? 1 : 0);
            let jMin = (piece.x) + ((piece.rotation === Direction.E) ? (-1) : 0);
            let jMax = (piece.x + piece.width - 1) + ((piece.rotation === Direction.W) ? 1 : 0);

            let cornerCount = 0;
            if(iMin >= 0 && jMax >= 0 && (rows[iMin][jMin] !== 0 && rows[iMin][jMin] < 10)){
              cornerCount++;
            }
            if(iMin >= 0 && jMax < rows[0].length && (rows[iMin][jMax] !== 0 && rows[iMin][jMax] < 10)){
              cornerCount++;
            }
            if(iMax < rows.length && jMin >= 0 && (rows[iMax][jMin] !== 0 && rows[iMax][jMin] < 10)){
              cornerCount++;
            }
            if(iMax < rows.length && jMax < rows[0].length && (rows[iMax][jMax] !== 0 && rows[iMax][jMax] < 10)){
              cornerCount++;
            }

            // still a t-spin if at bottom of board and have only one corner
            if(cornerCount > 0) {
              if(iMax >= rows.length) {
                cornerCount++;
              }
            }

            console.log("CornerCount:", cornerCount);

            if(cornerCount === 2) {
              isTSpin.current = false;
              isTSpinMini.current = true;
            }
            else if (cornerCount > 2){
              isTSpin.current = true;
              isTSpinMini.current = false;
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

        if(piece.lastMoveTrigger !== MovementTrigger.INPUT_DROP){
          props.actionCallback({type: ActionType.SET_PIECE})
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

      if(piece.lastTick !== tick.value){
      
        piece.xPrev = piece.x;
        piece.yPrev = piece.y;
        piece.y = Math.min(piece.y + 1, piece.yMax); 

        if(piece.y !== piece.yPrev) {

          piece.lastMoveTrigger = MovementTrigger.GRAVITY;
        }
        
        // console.log({pieceY: piece.y});
        piece.lastTick = tick.value;
        updatePosition()
      }
    }
    else  
    {
      let numCleared = 0;

      // CLEAR COMPLETE LINES
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
      clearedRows.current = [...clearedRowIndexesDesc];

      for(let i=0; i<clearedRowIndexesDesc.length; i++) {
        if(!clearEffectData.current){
          clearEffectData.current = []
        }
        if(i > 0 && clearedRowIndexesDesc[i-1] - clearedRowIndexesDesc[i] === 1){
          clearEffectData.current[clearEffectData.current.length - 1].top = `${(clearedRowIndexesDesc[i] - 4)}rem`;
        }
        else {
          clearEffectData.current.push(
            {
              top: `${(clearedRowIndexesDesc[i] - 4)}rem`,
              bottom: `${(24 - (clearedRowIndexesDesc[i] + 1))}rem`,
              left: `${-1}rem`,
              right: `${-1}rem`,
              id: (Math.round(performance.now()*1000).toString() + '.' + i.toString()),
            }
          );
        }
      }
      
      // Dear Future Self...
      // clearedRowIndexesDesc needs to (and should already) be sorted descending
      // no need to sort this array here, but remember that is required for this splice 
      // loop to work properly

      // This should be a memory optimized operation
      setTimeout(()=>{
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
      }, 200);
      

      // Check for and clear full rows 
      let points: number = 0;
      // console.log("updateBoard");

      if(numCleared > 0 || isTSpin.current || isTSpinMini.current) {

        if(stats.current) {
          // console.log("updatePoints");
          stats.current.lines += numCleared;
          let level: number = Math.floor(stats.current.lines / 10) + 1;
          if(stats.current.level !== level){
            stats.current.level = level;
            props.actionCallback({type: ActionType.LEVEL_UP});  
          }
    
          if(isTSpinMini.current) {
            points += ((numCleared > 0) ? (numCleared * 200) : 100) * level; 
          }
          else if(isTSpin.current) {
            points += (400 + (numCleared * 400)) * level; 
          }
          else {
            points += (((Math.max(numCleared - 1, 0) + numCleared)*100 + (numCleared === 4 ? 100 : 0)) * level);
          }
          
          stats.current.score += points;

          //TODO: implement all clear, combo, and back-to-back bonuses
        }

        let actionEnum = numCleared;
        let subtext: string | undefined = undefined;
        switch(numCleared) {
          case 0:
            actionEnum = isTSpin.current ? ActionType.T_SPIN : ActionType.T_SPIN_MINI;
            action.current = null;
            break;
          case ActionType.SINGLE:
            action.current = "Single!";
            if(isTSpin.current) {
              actionEnum = ActionType.T_SPIN_SINGLE;
            }
            else if(isTSpinMini.current) {
              actionEnum = ActionType.T_SPIN_MINI_SINGLE;
            }
            break;
          case ActionType.DOUBLE:
            action.current = "Double!";
            if(isTSpin.current) {
              actionEnum = ActionType.T_SPIN_DOUBLE;
            }
            else if(isTSpinMini.current) {
              actionEnum = ActionType.T_SPIN_MINI_DOUBLE;
            }
          break;
          case ActionType.TRIPLE:
            if(isTSpin.current) {
              actionEnum = ActionType.T_SPIN_TRIPLE;
            }
            action.current = "Triple!";
            break;
          case ActionType.TETRIS:
            action.current = "T E T R I S !";
            break;
        }

        if(isTSpin.current) {
          subtext = "T-Spin";
          isTSpin.current = false;
        }
        else if(isTSpinMini.current) {
          subtext = "T-Spin Mini";
          isTSpinMini.current = false;
        }

        props.actionCallback({type: actionEnum, text: action.current, subtext: subtext, points: points} || null);

        if(clearEffectData.current && clearEffectData.current.length > 0) {
          console.log(clearEffectData.current.toString())
          pauseGame(true, true);
        }
      }
    }
  };

  const getNextPiece = (): PieceQueItem => {

    // replenish que
    if(pieceQueIndexes.current && pieceQueIndexes.current.length <= 6) {
      pieceQueIndexes.current?.push(...randomBagDistribution(7, 2, 3, pieceQueIndexes.current));
    }

    let index: number = pieceQueIndexes.current?.shift() ?? -1;
    return {
      shapeEnum: index,
      id: Math.round(window.performance.now()*1000).toString()
    }
  }

  const getPieceFromQue = () => {
    if(pieceQue.current){
    pieceQue.current.push(getNextPiece());    
    // console.log(pieceQue.current);
    let newShapeEnum = pieceQue.current.shift();
    let p: ActivePiece = new ActivePiece(newShapeEnum, Direction.N );
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
    
    if(gameoverRef.current === true || !board.current) {
      // currently, no keyboard input should be processed if gameover (or board ref is null)
      return;
    }

    // if not gameover, pause should be allowed
    if(e.key === "Escape" && gameover === false) {
      if(!paused.current) {
        pauseGame();
        forceUpdate(1); // changes "Pause" button label to "Resume"
      }
      else {
        resumeGame();
      }
    }

    let p: ActivePiece | null = activePiece.current || null;

    //
    // The above "Escape" key handler will be the only input accepted when
    // any of the following are true:
    //
    //    1. no current active piece
    //    2. current active piece was already "insta dropped" (up arrow)
    //    3. game is paused
    //    4. ticker ref is null
    //
    if(!p || paused.current || !ticker.current || p.lastMoveTrigger === MovementTrigger.INPUT_DROP || p.lastMoveTrigger === MovementTrigger.INPUT_SET) {
      return;
    }
    
    switch(e.key) {
      
      case "/":
        if(holdQue.current) {
          if(holdQue.current.length > 0 && !p.wasInHold) {
            let heldPieceItem = holdQue.current.pop() as PieceQueItem;

            // erase active piece from board
            for(let i=0; i<p.coords.length;i++) {
              let y = p.coords[i][0];
              let x = p.coords[i][1];
              board.current[y][x] = 0;
            }

            if(heldPieceItem.shapeEnum !== TetronimoShape.NULL) {
              holdQue.current.push({shapeEnum: p.shapeEnum, id: p.id});
              activePiece.current = new ActivePiece(heldPieceItem, Direction.N );  
              activePiece.current.wasInHold = true; 
            }
            else {
              holdQue.current.push({shapeEnum: p.shapeEnum, id: p.id});
              activePiece.current = getPieceFromQue();
            }

            p = activePiece.current;
            props.actionCallback({type: ActionType.HOLD_PIECE})
          }
          else if(p.wasInHold) {
            props.actionCallback({type: ActionType.MOVE_NOT_ALLOWED})
          }
        }
        break;
      case "ArrowRight":
        if((p.x + p.width) < board.current[0].length) {
          
          // sfx_movePiece();

          props.actionCallback({type: ActionType.MOVE, data: e.key});
          p.xPrev = p.x;
          p.yPrev = p.y - 1;
          p.x += 1; 
          p.lastMoveTrigger = MovementTrigger.INPUT_LATERAL;
          updatePosition();      
        }
        break;
      case "ArrowLeft":
        if(p.x > 0) {
          props.actionCallback({type: ActionType.MOVE, data: e.key});
          // sfx_movePiece();
          p.xPrev = p.x;
          p.yPrev = p.y - 1;
          p.x -= 1; 
          p.lastMoveTrigger = MovementTrigger.INPUT_LATERAL;
          updatePosition();
        }
        break;
      case "ArrowDown":
        if(p.yPrev !== p.y && p.y < p.yMax ) {
          p.lastTick = tick.value;
          props.actionCallback({type: ActionType.MOVE_DOWN, data: e.key});
          // sfx_movePiece();
          p.yPrev = p.y;
          
          
          p.y += 1;

          // console.log("y:", p.y);
          // console.log(columnHeights.current?.toString());

          downArrowPressed.current = true;
          // tick.value = tick.value + 1; // optimization?
          p.lastMoveTrigger = MovementTrigger.INPUT_DOWN;
          updatePosition();
        }
        else if (p.yPrev === p.y || p.y >= p.yMax) {
          p.xPrev = p.x;
          p.y = Math.min(p.y, p.yMax);
          p.yPrev = p.y
          p.lastMoveTrigger = MovementTrigger.INPUT_SET;
          downArrowPressed.current = true;
          updateBoard();
        }
        break;

      // insta-drop the piece
      case "ArrowUp":
        
        p.lastMoveTrigger = MovementTrigger.INPUT_DROP;
        // p.dropped = true;

        const cols: number[][] = getBoardCols();
        let colIndex = p.x;
        let perm: number[][] = p.permutation;

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
        
        let minDistance: number = p.yMax - p.y;
        let minDistances = [];
        for(let i=0; i<p.width; i++) {
          let colArr: number[] = (cols[i + colIndex]);
          let dropDistance = bottomOffsets[i];
          for(let j=p.y; j<colArr.length; j++){
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

        dropEffectData.current = {
          top: `${(p.y - p.height - 4)}rem`,
          bottom: `${(24 - (p.y + minDistance))}rem`,
          left: `${p.x}rem`,
          right: `${(10 - p.x - p.width)}rem`,
          id: p.id
        };

        // console.log(JSON.stringify(bottomOffsets) + " " + JSON.stringify(minDistances));
        props.actionCallback({type: ActionType.DROP, data: e.key});

        p.xPrev = p.x;
        p.rotationPrev = p.rotation;
        if(minDistance > 0) {
          tSpun.current = false;
        }
        p.y += minDistance;
        p.yPrev = p.y;

        upArrowPressed.current = true;
        if(minDistance > 0) {
          // console.log(minDistance);
          updatePosition();
        }
        break;

      case "Alt":
      case "Control":
        p.rotateLeft();
        // props.actionCallback({type: ActionType.ROTATE, data: e.key});
        updatePosition();
        break;

      case "Shift":
        p.rotateRight();
        // props.actionCallback({type: ActionType.ROTATE, data: e.key});
        updatePosition();
        break;
    }
  }

  const initRefs = () => {

    pieceQue.current = [];
    pieceQueIndexes.current = [];
    holdQue.current = [{id:"-1",shapeEnum: TetronimoShape.NULL}];

    if(columnHeights.current === null) {
      columnHeights.current = new Int8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    else {
      columnHeights.current.fill(0);
    }
    
    if(board.current === null) { 
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
    else {
      for(let i=0;  i<board.current.length; i++) {
        for(let j=0;  j<board.current[0].length; j++) {
          board.current[i][j] = 0; 
        }
      }
    }
    
    action.current = "Action";
    
    if(stats.current === null) {
      stats.current = {
        level: 1,
        lines: 0,
        score: 0,
      }
    }
    else {
      stats.current.level = 1;
      stats.current.lines = 0;
      stats.current.score = 0;
    }

    isTSpin.current = false;
    isTSpinMini.current = false;
    upArrowPressed.current = false;
    downArrowPressed.current = false;
    tSpun.current = false;
    gameoverRef.current = false;
    paused.current = false;
  }

  const gameOver = () => {
    setGameover(true);
    gameoverRef.current = true;
    paused.current = true;
    pauseGame();
    props.actionCallback({type: ActionType.GAME_OVER});
  }

  const pauseGame = (discrete: boolean = false, forceRender: boolean = false) => {
    if(ticker.current){
      clearInterval(ticker.current);
      ticker.current = null;
    }
    if(!discrete) {
      paused.current = true;
    }
    if(forceRender){
      forceUpdate(1);
    }
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
      ...randomBagDistribution(7,2,3)
      );

      // console.log(pieceQueIndexes.current);

    let indices = pieceQueIndexes.current || [];
    for(let i=0; i<PIECE_QUE_LENGTH; i++) {
      pieceQue.current?.push({
        shapeEnum: indices[i],
        id: Math.round(window.performance.now() * 1000 - PIECE_QUE_LENGTH + i).toString()
      });
    }

    setTimeout(()=> {
      activePiece.current = getPieceFromQue();
      tSpun.current = false;
    },100);
  
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
      isTSpin.current = null;
      isTSpinMini.current = null;
      upArrowPressed.current = false;
      downArrowPressed.current = false;
      tSpun.current = false;
      gameoverRef.current = false;
      paused.current = false;

      if(ticker.current) {
        clearInterval(ticker.current);
        ticker.current = null;
      }

      document.removeEventListener("keydown", keydownHandler);
    }
  },[]);


  // Controls the game speed by level
  useEffect(() => {

    let speedIndex = Math.min((stats.current?.level || 1)-1,9);

    // if(tick.value % (Math.max(80 - 10*(stats.current?.level || 1),10)/10) === 0) {
    if((tick.value) % Math.round(1/GAME_SPEEDS[speedIndex]) === 0 
        || upArrowPressed.current   === true
        || downArrowPressed.current === true) {
            
      downArrowPressed.current = false;
      upArrowPressed.current = false;
      updateBoard(activePiece.current);
    }
    
  });

  const renderBoard = () => {
    if(!board.current){
      return
    };

    const rows = board.current;
    
    return rows.map((row, index) => {
      return (
        <div className={`tw-flex tw-flex-row tw-gap-0 tw-box-border tw-h-4 ${(clearedRows.current && clearedRows.current?.includes(index)) ? 'tw-opacity-0' : 'tw-opacity-1'}`}>
          
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
          
          initRefs();
          if(activePiece.current) {
            // activePiece.current = getNextPiece();
            activePiece.current = getPieceFromQue();
          }
          
          setGameover(false);
          resumeGame();
        }} disabled={
          paused.current === false && gameover === false
          }>{gameoverRef.current === true ? "Restart" : "New Game"}</button>
        <button 
          className={`tetris-font menu-button tw-border-slate-200 tw-w-32 tw-p-2 tw-text-md ${gameover ? 'disabled' : ''}`} 
          style={{paddingTop:"0.7rem"}}
          disabled={gameoverRef.current} 
          onClick={()=>{
          if(!paused.current) {
            pauseGame(false, true);
          }
          else {
            resumeGame();
          }
        }}>{paused.current ? 'Resume' : 'Pause'}</button>

        <ControlsMap clickCallback={(e)=>{ keydownHandler(e)}}/>
      </div>
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-mt-0">
        <div
        className="tw-flex tw-flex-row tw-gap-0 tw-items-start tw-justify-center tw-bg-slate-700 tw-bg-opacity-30 tw-rounded-xl tw-h-full tw-pl-0 tw-pb-0"
        style={{paddingTop: "2rem"}}>
          {/* <div className="game-left-pane tw-flex tw-flex-col tw-w-20 tw-items-top tw-justify-center tw-gap-0 tw-mt-24"></div> */}
          
          <PieceQue title={"HOLD"} queLength={1} position={"left"} animation='spinRight' disabled={activePiece.current && activePiece.current.wasInHold || false}
          pieces={
            holdQue?.current || [{id: "-1", shapeEnum: TetronimoShape.NULL}]
          }/>
          <div>
            <h5 className=" tw-hidden bg-green-100 game-clock tetris-font tw-text-lg">{tick.value}</h5>
            <div class="tw-pt-0 tw-h-80 tw-overflow-hidden tw-border-content tw-relative" style={{border:"1px solid rgba(200,200,200,1)"}}>
              
              { dropEffectData.current && 

                // @ts-expect-error
                <motion.div key={dropEffectData.current.id} className="drop-effect" 
                  onAnimationComplete={
                      ()=>{dropEffectData.current = null;
                    }}
                  variants={{
                    show: {
                      opacity: 1
                    }, 
                    hidden: {
                      opacity: 0
                    }}}
                  initial="show"
                  animate="hidden"
                  transition={{
                    duration: 0.25, 
                    ease:"easeOut"
                  }}
                  // transitionEnd = {{
                  //   display: 'none'
                  // }}
                  
                  style={{
                    top: dropEffectData.current.top,
                    left: dropEffectData.current.left,
                    right: dropEffectData.current.right,
                    bottom: dropEffectData.current.bottom
                    }}>

                </motion.div>
              }
              { clearEffectData.current &&
                clearEffectData.current.map((effect: any)=>{
                  return  (
                // @ts-expect-error
                  <motion.div key={effect.id} className="clear-effect" 
                    onAnimationComplete={
                      () => {
                        // make sure sound effect is only played once
                        // in the event that multiple effects are needed
                        if(clearEffectData.current !== null) {
                          clearEffectData.current = null;
                          props.actionCallback({type: ActionType.LINE_CLEAR_DROP});
                        }
                        clearedRows.current = null;
                        resumeGame();
                      }
                    }
                    // onUpdate={()=>{
                    //   console.log("clear effect update");
                    // }}
                    variants={{
                      show: {
                        opacity: 1,
                        transform: 'rotateX(0)'
                      }, 
                      hidden: {
                        opacity: 0,
                        transform: 'rotateX(90deg)'
                      }}}
                    initial="show"
                    animate="hidden"
                    transition={{
                      duration: 0.4, 
                      ease:"easeOut",
                      delay: 0.1,
                    }}
                    // transitionEnd = {{
                    //   display: 'none'
                    // }}
                    
                    style={{
                      top: effect.top,
                      left: effect.left,
                      right: effect.right,
                      bottom: effect.bottom
                      }}>

                  </motion.div>
                  );
                })
              }
              
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
          <PieceQue title={"NEXT"} queLength={PIECE_QUE_LENGTH} position={"right"}
          pieces={
            pieceQue?.current || [{id: "123", shapeEnum: 1},{id: "1", shapeEnum: 2},{id: "12", shapeEnum: 3},{id: "124", shapeEnum: 4},{id: "125", shapeEnum: 5}]
          }/>
        }
        </div>
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
