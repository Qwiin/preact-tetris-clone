/**

TODO:

Gameplay:

  1. (done) Implement GameOver State
  2. (done) Fix Collision Detection with left/right moves and rotation against set blocks
  3. (done) Implement Que (as a stack)
  4. (done) Balance the distribution of pieces (native RNG does not feel like Tetris, lol)
    a. There should be a more normal distribution considering a game to 100 lines is only 250-300 pieces

UI/UX:
  
  1. (done) Styleize UI
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
import { ActionType, BoardPosition, Direction, GAME_SPEEDS, GameAction, TETRONIMOES, TICK_INTERVAL, TetronimoShape, getLabelForActionType } from '../TetrisConfig';
import { newUID } from '../utils/AppUtil';
import { PieceQue } from './PieceQue';
import { StatsPanel } from './StatsPanel';
import { BaseComponentProps } from '../BaseTypes';
import { BoardBackground } from './BoardBackground';
import { MenuButtonAction, MenuPanel } from './MenuPanel';
import DropEffect from './DropEffect';
import LineClearEffect from './LineClearEffect';


const PIECE_QUE_LENGTH: number = 5;
// const LINE_CLEAR_TIMEOUT: number = 1000;

const tick: Signal<number> = signal(0);

// const actionSignal: Signal<string> = signal("action");

interface GameProps extends BaseComponentProps {
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

  let numRetries: number = 0;

  for(let k=0; k<numDistributions; k++) {
    let _bag = [...bag];

    while(_bag.length > 0) {

      let bagIndex = Math.round(Math.random() * (_bag.length-1));
      let drawnValue = _bag[bagIndex];
      
      let _retry = false;

      if(dist.length > 1 
        && dist[dist.length - 1] === drawnValue 
        && dist[dist.length - 2] === drawnValue) 
      {
        _retry = true;
      }
      else if(dist.length === 1 && prevDist && prevDist.length > 0) {
        if(dist[0] === drawnValue && prevDist[prevDist.length - 1] === drawnValue) {
          _retry = true;
        }
      }
      else if(dist.length === 0 && prevDist && prevDist.length > 1) {
        if(prevDist[prevDist.length - 1] === drawnValue && prevDist[prevDist.length - 2] === drawnValue) {
          _retry = true;
        }
      }

      if(_retry === true){
        numRetries++;
        continue;
      }
      
      dist.push(_bag.splice(bagIndex,1)[0]);
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
  const frameCount = useRef(0);
  
  const clearedRows: Ref<number[]> = useRef(null);
  // const clearedRowIndexesDesc: Ref<number[]> = useRef(null);
  const clearEffectData: Ref<any> = useRef(null);
  const dropEffectData: Ref<any> = useRef(null);
  const pieceWasSet = useRef(false);

  const activePiece: Ref<ActivePiece> = useRef(null);
  const pieceQueIndexes: Ref<number[]> = useRef(null);
  const pieceQue: Ref<PieceQueItem[]> = useRef(null);
  const holdQue: Ref<PieceQueItem[]> = useRef([{id:"-1",shapeEnum: TetronimoShape.NULL}]);

  const stats: Ref<Scoring> = useRef(null);
  
  const downArrowPressed = useRef(false);
  const upArrowPressed = useRef(false);
  const isTSpin: Ref<boolean> = useRef(null);
  const isTSpinMini: Ref<boolean> = useRef(null);
  const tSpun = useRef(false);

  const comboCount: Ref<number> = useRef(0);
  const lastPieceAction: Ref<ActionType> = useRef(0);
  const lastPiecePosition: Ref<any> = useRef(null);
  const lastLineClearAction: Ref<ActionType> = useRef(null);

  const board: Ref<number[][]> = useRef(null);
  const boardCols: Ref<number[][]> = useRef(null);
  const columnHeights: Ref<Int8Array> = useRef(null);
  const ghostPieceCoords: Ref<number[][]> = useRef(null); // [[row1,col1],[row2,col2]...]


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

  // TODO: implement a way of caching columns. getting columns everytime a drop is done is expensive
  const updateBoardCols = () => {
    if(!board.current || !boardCols.current){
      console.error("cannot update boardCols");
      return;
    }

    let rowLen = board.current[0].length;
    let cells = board.current.flat();
    let colLen = board.current.length;
    for (let i = 0; i < rowLen; i++) {
      // let col: number[] = [];
      for (let j = 0; j < colLen; j++) {
        let cellValue = cells[j * rowLen + i];
        if(cellValue >= 0 ){
          boardCols.current[i][j] = (cells[j * rowLen + i]);
        }
        else {
          boardCols.current[i][j] = 0
        }
      }
    }
  };

  const getDropDistance = (): number => {
    // updateBoardCols();

    const cols = boardCols.current;
    const p = activePiece.current;

    if(!p || !cols) {
      console.error("cannot determine drop distance");
      return 0;
    }
    
    let colIndex = p.x;
    let perm: number[][] = p.permutation;

    //
    // Gets the offsets from the bottoms contour of the piece's current permutation
    //
    let bottomOffsets: number[] = [];
    for(let i=0; i<p.width; i++) {
      bottomOffsets.push(0);
      for(let j=p.height-1; j>=0; j--) {
        if(perm[j][i] > 0) {
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
        if(colArr[j] > 0 && colArr[j] < 10) {
          break;
        }
        dropDistance++;
      }
      minDistances.push(minDistance);
      if(dropDistance < minDistance) {
        minDistance = dropDistance;
      }
    }

    return minDistance;
  }

  // TODO: make sure the piece.lastTick is updated each time updatePosition is called;
  // updatePosition should not be called twice in the same tick.
  const updatePosition = () => {
    if(!board.current || !activePiece.current || clearEffectData.current) {
      return
    }

    const rows = board.current;
    const p: ActivePiece = activePiece.current;
    let perm: number[][] = p.permutation;
    let h: number = p.height;
    let w: number = p.width;
    
    let rotationAttempted = false;
    let failedRotation = false;
    let rotationType = ActionType.NONE;

    // let canMoveLateral = true;
    if (p.rotation !== p.rotationPrev) {
      rotationAttempted = true;
    
      let j_iii = p.x;
      let i_iii = p.y - 1;
      let i_sss = h-1;
      
      // let dx = p.x - p.xPrev;
      let dy = p.y - p.yPrev;

      let rotatedClockwise = (p.rotation - p.rotationPrev === 1 || p.rotation - p.rotationPrev === -3);

      rotationType = ( rotatedClockwise === true ) 
        ? ActionType.ROTATE_RIGHT 
        : ActionType.ROTATE_LEFT;

      let canRotateInPlace = true;
      let canTSpin = true;
      let canTSpinLeft = rotatedClockwise;
      let canTSpinRight = !rotatedClockwise;

      // let canMoveDown = true;
      for(let i=i_iii; i > (i_iii - h); i--) {
        let j_sss = 0;
        for(let j=j_iii; j < (j_iii + w); j++) {
          if(canRotateInPlace && perm[i_sss][j_sss] > 0 && i >= 0 && j >= 0 && rows[i][j] > 0 && rows[i][j] !== perm[i_sss][j_sss]) {
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
            if(canTSpin && perm[i_sss][j_sss] > 0 && (i+dy) >= 0 && (j) >= 0 && rows[i+dy][j] > 0 && rows[i+dy][j] !== perm[i_sss][j_sss]) {
              // if(p.y !== p.yPrev){
              //   canMoveDown = false;
              //   console.log("can't move down...");
              //   p.y = p.yPrev;
              // }
              canTSpin = false;
            }
            if(canTSpinLeft) {
              if(j === 0 || (perm[i_sss][j_sss] > 0 && (i+dy) >= 0 && (j-1) >= 0 && rows[i+dy][j-1] > 0 && rows[i+dy][j-1] !== perm[i_sss][j_sss])) {
                canTSpinLeft = false;
              }
            }
            if(canTSpinRight && j === (p.xMax-2) || (perm[i_sss][j_sss] > 0 && (i+dy) >= 0 && (j+1) >= 0 && rows[i+dy][j+1] > 0 && rows[i+dy][j+1] !== perm[i_sss][j_sss])) {
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
          if(cellValue > 0 && cellValue < 10){
            p.x = p.xPrev;
          }   
        }
      }
      if(p.x !== p.xPrev){
        p.yPrev = p.y - 1;
      }
    }

    if(!failedRotation && rotationAttempted) {
      props.actionCallback({type: rotationType});
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
          if(perm[i_s][j_s] > 0 && i >= 0 && j >= 0 && rows[i][j] > 0 && rows[i][j] !== perm[i_s][j_s]) {
            canMoveDown = false;
            p.y = p.yPrev;
          }
          if(i >= rows.length-1) {
            canMoveDownTwice = false;
          }
          else if(perm[i_s][j_s] > 0 && i+1 >= 0 && i<23 && j >= 0 && rows[i+1][j] > 0 && rows[i+1][j] !== perm[i_s][j_s]) {            
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

      //--------------------
      // erase old location
      //--------------------
      for(let i=0; i<p.coords.length; i++){
        if(p.coordsGhost && p.coordsGhost.length > i && board.current[p.coordsGhost[i][0]][p.coordsGhost[i][1]] <= 0) {
          board.current[p.coordsGhost[i][0]][p.coordsGhost[i][1]] = 0;
        }
        board.current[p.coords[i][0]][p.coords[i][1]] = 0;
      }

      p.xPrev = p.x;



      //--------------------
      // getGhost Piece location
      //--------------------

      let ghostY = -1;

      let updateGhostCoords = ( canMoveDown && canMoveDownTwice && !tSpun.current && (
          p.lastMoveTrigger !== MovementTrigger.INPUT_DROP || p.coordsGhost.length === 0
        ));

      if(updateGhostCoords) {
        const dropDistance: number = getDropDistance();
        // console.log(dropDistance);
        if(dropDistance <= 0) {
          updateGhostCoords = false;
        }
        ghostY = Math.min(p.y + dropDistance - 1, 23);
      }
       
      //--------------------
      // write new location
      //--------------------

      j_i = p.x;
      i_i = p.y-1;
      let i_ss = h-1;
      let newCoords: number[][] = [];
      let newCoordsGhost: number[][] = [];
      for(let i=i_i; i > (i_i - h); i--) {
        
        let j_s = 0;
        for(let j=j_i; j < (j_i + w); j++) {
          if(perm[i_ss][j_s] > 0 && i >= 0 && j >= 0 && (board.current[i][j] === 0 || board.current[i][j] === p.cellValue)) {

            if(updateGhostCoords) {
              newCoordsGhost.unshift([ghostY-h+i_ss+1, j]);
              let ghostCellValue = board.current[newCoordsGhost[0][0]][newCoordsGhost[0][1]];
              if( ghostCellValue <= 0 ) {
                board.current[newCoordsGhost[0][0]][newCoordsGhost[0][1]] = perm[i_ss][j_s] * -1;
                // ghostCoords.push(`[${24 - colHeightsSub[j_s] - (h - i_ss)},${j}]`);
              }
            }

            board.current[i][j] = perm[i_ss][j_s];
            newCoords.unshift([i,j]);
          }
          j_s++;
        }
        i_ss--;
      }

      // if(updateGhostCoords) {
      //   console.log("gst:" + JSON.stringify(newCoordsGhost));
      //   console.log("new: " + JSON.stringify(newCoords));
      //   // console.log(JSON.stringify(ghostYX));
      //   console.log({ghostY});
      // }

      if(p.lastMoveTrigger === MovementTrigger.INPUT_DOWN && stats.current) {
        stats.current.score += 1;
      }

      p.coordsPrev = p.coords;
      p.coords = newCoords;
      p.coordsGhost = newCoordsGhost;

      // this is run before the render, so we need to know if the piece will thud on next paint
      if(
        (p.lastMoveTrigger === MovementTrigger.GRAVITY 
          || p.lastMoveTrigger === MovementTrigger.INPUT_DOWN) 
          && !canMoveDownTwice && !failedRotation) {
        console.log("can't move down twice...");
        props.actionCallback({type: ActionType.THUD});
      }
    }
  }

  /**
   * the purposes of this function are:
   *   1a. to set the active piece in place on the board
   *   1b. to set the active piece to null and fetch a new active piece after a delay
   *   2. to perform line clears
   *   3.
   * @param piece 
   * @returns 
   */
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

          // update column heights
          if(colHeights) {
            colHeights[x] = Math.max((nRows - y), colHeights[x]);
            // console.log(colHeights.toString());
          }

          //check for gameover//
          if(newCellVal > 0 && newCellVal < 0.9) {
            gameOver();
            return;
          }
          lastPiecePosition.current = {
            top: piece.y - piece.height - 4,
            left: piece.x,
            width: piece.width,
            height: piece.height
          }
        }

        // now that piece is set in place, we can update the board columns ref
        updateBoardCols();
        
        // Verify and complete T-SPIN
        if(piece.shapeEnum === TetronimoShape.T && tSpun.current === true) {
            let iMin = (piece.y - piece.height) + ((piece.rotation === Direction.S) ? (-1) : 0);
            let iMax = (piece.y - 1) + ((piece.rotation === Direction.N) ? 1 : 0);
            let jMin = (piece.x) + ((piece.rotation === Direction.E) ? (-1) : 0);
            let jMax = (piece.x + piece.width - 1) + ((piece.rotation === Direction.W) ? 1 : 0);

            let cornerCount = 0;
            if(iMin >= 0 && jMax >= 0 && (rows[iMin][jMin] > 0 && rows[iMin][jMin] < 10)){
              cornerCount++;
            }
            if(iMin >= 0 && jMax < rows[0].length && (rows[iMin][jMax] > 0 && rows[iMin][jMax] < 10)){
              cornerCount++;
            }
            if(iMax < rows.length && jMin >= 0 && (rows[iMax][jMin] > 0 && rows[iMax][jMin] < 10)){
              cornerCount++;
            }
            if(iMax < rows.length && jMax < rows[0].length && (rows[iMax][jMax] > 0 && rows[iMax][jMax] < 10)){
              cornerCount++;
            }

            // still a t-spin if at bottom of board and have only one corner
            if(cornerCount > 0) {
              if(iMax >= rows.length) {
                cornerCount++;
              }
            }

            // console.log("CornerCount:", cornerCount);

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
          // updatePosition();
          pieceWasSet.current = true;
          updateBoard(null);

          requestAnimationFrame(()=>{
          requestAnimationFrame(()=>{
          requestAnimationFrame(()=>{
            // if(clearEffectData.current !== null) {
            //   // fix for mobile rendering bug
            //   // next piece will be grabbed after clear effect
            //   // animation completes
            //   return;
            // }
            activePiece.current = getPieceFromQue() || null;   

            // add piece to board
            updatePosition();
          });
          });
          });
        });

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
        piece.lastTick = tick.value;    // This may or may not be the most important
        updatePosition();
      }
    }
    else  
    {
      if(!pieceWasSet.current) {
        console.log("Piece Not Set");
        return;
      }

      let numCleared = 0;

      // CHECK FOR COMPLETE LINES
      // Method: find full rows and recycle them

      const _clearedRows = clearedRows.current;
      if(!_clearedRows) {
        console.error("cleared rows is null");
        return;
      }
      else {
        _clearedRows.fill(-1);
      }

      for(let i=nRows-1; i>=0; i--){
        let row = rows[i];
        if(!row.includes(0) && numCleared < 4){
          row.fill(0);  // clear line (erase the row);
          _clearedRows[numCleared] = i;
          numCleared++;
          if(numCleared === 4) {  // TODO: cache height of last piece
            break;
          }
        }
      }

      
      // GET POSITIONS FOR CLEARED LINES AND PASS THE DATA 
      // ALONG IN THE ACTION CALLBACK TO POSITION THE POINTS TOAST

      let boardPositions: BoardPosition[] = [];
      if(numCleared > 0) {

        // clearedRows.current = [...clearedRowIndexesDesc];
        let prevClearedIndex = -1;
        for(let i=0; i<_clearedRows.length; i++) {
          if(!clearEffectData.current){
            clearEffectData.current = [];
          }

          let top = (_clearedRows[i] - 4);
          let bottom = 24 - (_clearedRows[i] + 1);

          if(i > 0 && _clearedRows[i] >= 0 && prevClearedIndex >= 0 && _clearedRows[prevClearedIndex] - _clearedRows[i] === 1){
            clearEffectData.current[clearEffectData.current.length - 1].top = `${top}rem`;
            boardPositions[clearEffectData.current.length - 1].top = top;
            boardPositions[clearEffectData.current.length - 1].height += 1;
          }
          else {
            boardPositions.push(
              {
                top,
                left: 0,
                width: 10,
                height: 20 - bottom - top,
              }
            );
            clearEffectData.current.push(
              {
                top: `${top}rem`,
                bottom: `${bottom}rem`,
                left: `${-1}rem`,
                right: `${-1}rem`,
                id: newUID(),
              }
            );
          }
          prevClearedIndex = i;
        }

        // Dear Future Self...
        // _clearedRows needs to (and should already) be sorted descending (ignoring)
        // no need to sort this array here, but remember that is required for this splice 
        // loop to work properly

        // This should be a memory optimized operation
        requestAnimationFrame(()=>{
          requestAnimationFrame(()=>{

            let shiftCount: number = 0;
            for(let j=0; j<_clearedRows.length; j++) {  
              if(_clearedRows[j] >= 0) {
                console.log(_clearedRows.toString());
                rows.unshift(rows.splice(_clearedRows[j]+shiftCount,1)[0]);  // shift cleared rows to the top of the board;
                shiftCount++;
              }
            }
            
            let colHeights = columnHeights.current || [];
            for(let i=0; i<colHeights.length; i++){
              colHeights[i] = Math.max(colHeights[i] - numCleared, 0); 
            }
          
            // now that rows are cleared and board ref is updated, we can update the columns ref
            updateBoardCols();
          });
        });
      }
      
      let points: number = 0;
      // console.log("updateBoard");

      if(numCleared > 0 || isTSpin.current || isTSpinMini.current) {

        let actionEnum = numCleared;
        let actionText: string = "";
        switch(numCleared) {
          case 0:
            actionEnum = isTSpin.current ? ActionType.T_SPIN : ActionType.T_SPIN_MINI;
            break;
          case ActionType.SINGLE:
            actionText = getLabelForActionType(ActionType.SINGLE);
            if(isTSpin.current) {
              actionEnum = ActionType.T_SPIN_SINGLE;
            }
            else if(isTSpinMini.current) {
              actionEnum = ActionType.T_SPIN_MINI_SINGLE;
            }
            break;
          case ActionType.DOUBLE:
            actionText = getLabelForActionType(ActionType.DOUBLE);
            if(isTSpin.current) {
              actionEnum = ActionType.T_SPIN_DOUBLE;
            }
            else if(isTSpinMini.current) {
              actionEnum = ActionType.T_SPIN_MINI_DOUBLE;
            }
          break;
          case ActionType.TRIPLE:
            actionText = getLabelForActionType(ActionType.TRIPLE);
            if(isTSpin.current) {
              actionEnum = ActionType.T_SPIN_TRIPLE;
            }
            
            break;
          case ActionType.TETRIS:
            actionText = getLabelForActionType(ActionType.TETRIS);
            actionEnum = ActionType.TETRIS;
            break;
        }


        let backToBack = false;
        if((actionEnum === lastLineClearAction.current && actionEnum === ActionType.TETRIS)
          || (actionEnum === lastPieceAction.current && (
            actionEnum === ActionType.T_SPIN_MINI_SINGLE 
            || actionEnum === ActionType.T_SPIN_MINI_DOUBLE 
            || actionEnum === ActionType.T_SPIN_SINGLE 
            || actionEnum === ActionType.T_SPIN_DOUBLE 
            || actionEnum === ActionType.T_SPIN_TRIPLE
          ))) {
          backToBack = true;
        }

        if(isTSpin.current) {
          // subtext = "T-Spin";
          isTSpin.current = false;
        }
        else if(isTSpinMini.current) {
          // subtext = "T-Spin Mini";
          isTSpinMini.current = false;
        }
        else {
          lastLineClearAction.current = numCleared;
        }

        if(comboCount.current === null || stats.current === null){
          console.error("comboCount ref is null");
          return;
        }
        

        comboCount.current += 1;
        console.log("Combo count: " + comboCount.current);


        // console.log("updatePoints");
        stats.current.lines += numCleared;

        const level: number = Math.floor(stats.current.lines / 10) + 1;
        const comboBonus: number = comboCount.current * level * 50;

        // update level
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

        // add bonuses
        stats.current.score += (points * (backToBack ? 1.5 : 1)) + comboBonus;


        //TODO: implement all clear
        //DONE: combo, and back-to-back bonuses
        
        props.actionCallback({
          type: actionEnum, 
          id: newUID(),
          timestamp: (window.performance.now() / 1000),
          text: actionText, 
          points: `${points * (backToBack ? 1.5 : 1 )}`,
          combo: comboCount.current > 0 ? comboCount.current : undefined, 
          comboPoints: comboBonus,
          toast: true,
          boardPositions,
          piecePosition: lastPiecePosition.current || undefined,
          backToBack: backToBack,
          transitioning: true,
        } as GameAction);
          

        if(clearEffectData.current && clearEffectData.current.length > 0) {
          // console.log(clearEffectData.current.toString())
          pauseGame(true, true);
        }

      }
      else {
        // no scoring move
        console.log("no scoring move");
        console.log("comobo counter reset to -1");

        pieceWasSet.current = false;
        comboCount.current = -1;
        lastPieceAction.current = ActionType.NO_LINES_CLEARED;
        lastLineClearAction.current = ActionType.NO_LINES_CLEARED;
          
      }
    }
  };

  const getNextPiece = (): PieceQueItem => {

    // replenish piece que
    if(pieceQueIndexes.current && pieceQueIndexes.current.length <= 6) {
      pieceQueIndexes.current.push(...randomBagDistribution(7, 2, 3, pieceQueIndexes.current));
    }

    // 
    let index: number = pieceQueIndexes.current?.shift() ?? -1;
    return {
      shapeEnum: index,
      id: newUID()
    }
  }

  const getPieceFromQue = () => {
    if(pieceQue.current){

      pieceQue.current.push( getNextPiece() );    
      
      let pieceItem = pieceQue.current.shift();
      if(!pieceItem) {
        console.error("no piece item in que");
        return null;
      };
      
      const {xStart, yStart} = getStartingXY(pieceItem);
       
      let p: ActivePiece = new ActivePiece(pieceItem, Direction.N, undefined, xStart, yStart);
      
      let c: number[][] = [];
      for(let i=0; i<p.height; i++) {
        for(let j=0; j<p.width; j++) {
          c.push([p.y-i,p.x+j]);
        }
      }
      p.coords = c;
      return p;
    }

    console.error("Game::getPieceFromQue() -- piece que is undefined");
    return null;
  }

  /**
   * Utility method to get the starting x,y position for 
   * a new active piece
   * @param item 
   * @returns 
   */
  const getStartingXY = (item: PieceQueItem) => {

      if(!item) {
        console.error("Game::getStartingXY(item) -- 'item' is '" + item + "'");
        return {};
      }

      let h = TETRONIMOES[item?.shapeEnum || 0].length;
      let w = TETRONIMOES[item?.shapeEnum || 0][0].length;

      let xStart: number = Math.floor((10 - w)/2);
      let yStart: number = 4 + h;

      let maxColumnHeightUnderNewPiece = 0;
      if(columnHeights.current) {
        for(let i=xStart; i<(xStart + w); i++) {
          if(columnHeights.current[i] > maxColumnHeightUnderNewPiece) {
            maxColumnHeightUnderNewPiece = columnHeights.current[i];
          }
        }
      }
      // adjust starting y position if board is stacked higher than starting height projection of piece
      if(maxColumnHeightUnderNewPiece > 18){
        yStart = (board.current?.length || 24) - maxColumnHeightUnderNewPiece - 1;
      }

      console.log({xStart, yStart});

      return {xStart, yStart};
  }

  const keydownHandler = (e:any) => {
    
    if(gameoverRef.current === true || !board.current) {
      // currently, no keyboard input should be processed if gameover (or board ref is null)
      return;
    }

    // if not gameover, pause should be allowed
    if(e.key === "Escape" && gameoverRef.current === false) {
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

              if(p.coordsGhost.length > i) {
                let yG = p.coordsGhost[i][0];
                let xG = p.coordsGhost[i][1];
                board.current[yG][xG] = 0;
              }
            }

            if(heldPieceItem.shapeEnum !== TetronimoShape.NULL) {
              holdQue.current.push({shapeEnum: p.shapeEnum, id: p.id});
              activePiece.current = new ActivePiece(heldPieceItem, Direction.N );  
              activePiece.current.wasInHold = true; 
            }
            else {
              holdQue.current.push({shapeEnum: p.shapeEnum, id: p.id});
              activePiece.current = getPieceFromQue() || null;
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
          props.actionCallback({type: ActionType.MOVE_RIGHT, data: e.key});
          p.xPrev = p.x;
          p.yPrev = p.y - 1;
          p.x += 1; 
          p.lastMoveTrigger = MovementTrigger.INPUT_LATERAL;
          updatePosition();      
        }
        break;
      case "ArrowLeft":
        if(p.x > 0) {
          props.actionCallback({type: ActionType.MOVE_LEFT, data: e.key});
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
          // updateBoard();
          updateBoard(activePiece.current);
          
        }
        break;

      // insta-drop the piece
      case "ArrowUp":
        
        p.lastMoveTrigger = MovementTrigger.INPUT_DROP;

        const dropDistance = getDropDistance();

        dropEffectData.current = {
          top: `${(p.y - p.height - 4)}rem`,
          bottom: `${(24 - (p.y + dropDistance))}rem`,
          left: `${p.x}rem`,
          right: `${(10 - p.x - p.width)}rem`,
          id: p.id
        };

        // console.log(JSON.stringify(bottomOffsets) + " " + JSON.stringify(minDistances));
        
        p.xPrev = p.x;
        p.rotationPrev = p.rotation;
        if(dropDistance > 0) {
          tSpun.current = false;
        }
        p.y += dropDistance;
        p.yPrev = p.y;

        upArrowPressed.current = true;
        if(dropDistance > 0) {
          props.actionCallback({type: ActionType.DROP, data: e.key});
          if(stats.current) {   
            stats.current.score += (dropDistance * 2);
          }
          // console.log(minDistance);
          updatePosition();
        }
        break;

      case "Alt":
      case "Control":
        p.rotateLeft();
        p.lastMoveTrigger = MovementTrigger.INPUT_ROTATE;
        updatePosition();
        break;

      case "Shift":
        p.rotateRight();
        p.lastMoveTrigger = MovementTrigger.INPUT_ROTATE;
        updatePosition();
        break;
    }
  }

  const initRefs = () => {

    pieceQueIndexes.current = [];
    pieceQueIndexes.current?.push(
      ...randomBagDistribution(7,2,3)
    );
    holdQue.current = [{id:"-1",shapeEnum: TetronimoShape.NULL}];

    let indices = pieceQueIndexes.current;
    pieceQue.current = [];
    for(let i=0; i<PIECE_QUE_LENGTH; i++) {
      pieceQue.current.push({
        shapeEnum: indices[i],
        id: newUID()
      });
    }

    if(columnHeights.current === null) {
      columnHeights.current = new Int8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    else {
      columnHeights.current.fill(0);
    }

    ghostPieceCoords.current = [];
    
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
        board.current[i].fill(0);
      }
    }

    if(boardCols.current === null) { 
      boardCols.current = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];
    }
    else {
      for(let i=0;  i<boardCols.current.length; i++) {
        boardCols.current[i].fill(0);
      }
    }
    
    if(clearedRows.current === null) {
      clearedRows.current = [];
    }
    else {
      clearedRows.current.fill(-1);
    }

    lastPieceAction.current = ActionType.NONE;
    lastLineClearAction.current = ActionType.NO_LINES_CLEARED;
    
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
    tSpun.current = false;

    upArrowPressed.current = false;
    downArrowPressed.current = false;

    gameoverRef.current = false;
    paused.current = false;

    comboCount.current = -1;
    lastLineClearAction.current = ActionType.NO_LINES_CLEARED;
    lastPieceAction.current = ActionType.NONE;

    frameCount.current = 0;
  }

  const initGame = () => {
    setGameover(false);
    gameoverRef.current = false;
    resumeGame();

    setTimeout(()=> {
      activePiece.current = getPieceFromQue();
      tSpun.current = false;
    },100);
  
  }

  // component did mount
  useEffect(()=>{

    initRefs();

    initGame();

    document.addEventListener("keydown", keydownHandler);

    return () => {
      // null out references for GC
      pieceQue.current = null;
      pieceQueIndexes.current = null;
      activePiece.current = null;

      board.current = null;
      boardCols.current = null;
      
      columnHeights.current = null;
      
      tSpun.current = false;
      isTSpin.current = null;
      isTSpinMini.current = null;
      
      upArrowPressed.current = false;
      downArrowPressed.current = false;
      
      gameoverRef.current = false;
      paused.current = false;
      
      stats.current = null;
      comboCount.current = null;
      lastLineClearAction.current = null;
      lastPieceAction.current = null;
      lastPiecePosition.current = null;

      if(ticker.current) {
        clearInterval(ticker.current);
        ticker.current = null;
      }

      document.removeEventListener("keydown", keydownHandler);
    }
  },[]);


  // render current frame
  useEffect(() => {

    let speedIndex = Math.min((stats.current?.level || 1)-1,9);

    // if(tick.value % (Math.max(80 - 10*(stats.current?.level || 1),10)/10) === 0) {
    if((tick.value) % Math.round(1/GAME_SPEEDS[speedIndex]) === 0 
        || upArrowPressed.current   === true
        || downArrowPressed.current === true) {
            
      frameCount.current += 1;    
      downArrowPressed.current = false;
      upArrowPressed.current = false;
      updateBoard(activePiece.current);
    }
    
  }, [tick.value]);

  const renderBoard = () => {
    if(!board.current){
      return
    };

    const rows = board.current;
    
    return rows.map((row, index) => {
      return (
        <div key={`r${index}`} className={`tw-flex tw-flex-row tw-gap-0 tw-box-border tw-h-4 ${(clearedRows.current && clearedRows.current?.includes(index)) ? 'tw-opacity-0' : 'tw-opacity-1'}`}>
          
          { 
            row.map((cellValue, colIndex) => {

            let isGhost = cellValue < -10;
            // let ShapeColorsVal = Math.abs(cellValue) > 10 ? ShapeColors[Math.abs(cellValue)/11] : ShapeColors[cellValue]
            let cellColor =
              cellValue === 0
                ? 'empty-cell tw-border-gray-900'
                : `cell-color-${cellValue} ${!isGhost ? `filled-cell` : `ghost-cell`}`;
            return (
              <div
                key={`c${colIndex}`}
                className={`board-cell ${cellColor}`}
              ></div>
            );
          })}
        </div>
      );
    });

  };

  // const menuButtonCallback = (action: MenuButtonAction) => {
  function menuButtonCallback(action: MenuButtonAction) {
    if(action === "restart") {    
      initRefs();
      initGame();
      // if(!activePiece) {
      //   // @ts-expect-error
      //   activePiece.current = getNextPiece();
      //   // activePiece = getPieceFromQue();
      // }
      
      // setGameover(false);
      // resumeGame();
      return;
    }
    if(action === "pause") {
      if(!paused.current) {
        pauseGame(false, true);
      }
      else {
        resumeGame();
      }
    }
  }

  return (
    <div data-layout={props.layout} className="panels-container">
      
      <MenuPanel 
      layout={props.layout}
      gameover={gameoverRef.current}
      paused={paused.current}
      controlMapCallback={
        (e: any)=>{
          keydownHandler(e)
        }
      }
      menuButtonCallback={ menuButtonCallback }
      ></MenuPanel>

      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-mt-0">
        <div id="GameContainer" data-layout={props.layout} className="game-container">
          {/* <div className="game-left-pane tw-flex tw-flex-col tw-w-20 tw-items-top tw-justify-center tw-gap-0 tw-mt-24"></div> */}

          <div id="DevTools">
            <h5 className=" tw-hidden game-clock tetris-font tw-text-lg">{frameCount.current}</h5>
          </div>

          <PieceQue id="HoldQue" 
            title={"HOLD"} 
            queLength={1} 
            position={"left"} 
            animation={"spinRight"} 
            disabled={activePiece.current && activePiece.current.wasInHold || false}
            layout={props.layout} 
            onTap={()=>{keydownHandler({key: '/'})}} 
            pieces={
              holdQue?.current || [{id: "-1", shapeEnum: TetronimoShape.NULL}]
            }/>

          <div>
            <BoardBackground/>
            <div class="board-grid-mask">
              
              {/* Effects go here until Effect Layer is implemented */}
              { dropEffectData.current && 
                <DropEffect
                  position={dropEffectData.current} 
                  onAnimationComplete={()=>{
                    dropEffectData.current = null
                  }}/>
              }
              
              { clearEffectData.current &&
                <LineClearEffect
                  positions={clearEffectData.current} 
                  onAnimationComplete={() => {
                    // make sure sound effect is only played once
                    // in the event that multiple effects are needed
                    if(clearEffectData.current !== null) {
                      clearEffectData.current = null;
                      props.actionCallback({type: ActionType.LINE_CLEAR_DROP});
                    }
                    if(clearedRows.current) {
                      clearedRows.current.fill(-1);
                    }
                    resumeGame();
                  }}/>
              }
              
              <div className="board-grid"  style={{transform: "translateY(-4.0rem)"}}>
                {renderBoard()}
              </div>

              { ( gameover || paused.current ) &&
                <div className="tw-flex tw-items-center tw-justify-center tw-absolute tw-w-40 tw-h-80 tw-bg-black tw-bg-opacity-40 tw-z-10 tw-top-0 tw-left-0">
                  <h2 className="tw-text-center tetris-font tw-text-xl tw-text-zinc-400">{gameover ? 'Game Over' : 'Paused'}</h2>
                </div>
              }

            </div>
          </div>

          { pieceQue.current &&
            <PieceQue layout={props.layout} title={"NEXT"} queLength={PIECE_QUE_LENGTH} position={"right"}
            pieces={
              pieceQue?.current || [{id: "123", shapeEnum: 1},{id: "1", shapeEnum: 2},{id: "12", shapeEnum: 3},{id: "124", shapeEnum: 4},{id: "125", shapeEnum: 5}]
            }/>
          }

        </div>
      </div>
      <StatsPanel layout={props.layout} fields={[
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
