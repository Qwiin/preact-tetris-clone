import { forwardRef, useRef } from "preact/compat";
import Game from "./Game";
import { Ref } from "preact";


export function GameWrapper() {

  const boardRef: Ref<HTMLDivElement> = useRef(null);

  return (<>
    {/* @ts-expect-error Preact Component */}
    <Game {...props}></Game>
    <GameBoard clearedRows={[]} ref={boardRef}></GameBoard>
  </>)
}

interface Props {
  clearedRows: number[];
}
const GameBoard = forwardRef(function GameBoard(props: Props, ref: Ref<HTMLDivElement>) {

  const board: Ref<number[][]> = useRef([]);

  const renderBoard = () => {
    if(!board){
      return
    };

    const rows = board.current;
    
    return rows?.map((row, index) => {
      return (
        <div key={`r${index}`} className={`tw-flex tw-flex-row tw-gap-0 tw-box-border tw-h-4 ${(props.clearedRows && props.clearedRows.includes(index)) ? 'tw-opacity-0' : 'tw-opacity-1'}`}>
          
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
  return (<>
    <div ref={ref} className="board-grid"  style={{transform: "translateY(-4.0rem)"}}>
      {renderBoard()}
    </div>
  </>)
});