import { TETRONIMOS, ShapeColors } from "./TetrisConfig";

interface PieceQueProps {
  title: string;
  queLength: number;
  pieces?: number[][][];
}

const defaultPropsPieceQue: PieceQueProps = {
  title: "Que",
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

export function PieceQue(props: PieceQueProps) {

  return (
    <>
      <div className="tw-flex tw-relative tw-flex-col tw-w-20 tw-items-center tw-justify-start tw-gap-0 tw-mt-3 tw-h-80 tw-bg-black tw-rounded-xl tw-pt-4 tw-pb-4 tw-pr-2 tw-pl-3" style={{transform: "translateX(-33%) translateY(1.13px) scale(60%)", zIndex:"-1", border:"1px solid rgba(255,255,255,0.8)", borderTopLeftRadius:"0", borderBottomLeftRadius:"0"}}>
      <h5 className="tw-flex-none tw-relative tw-top-1 tw-h-0 tw-p-0 tw-mb-6" style={{marginTop: "-12px"}}>{props.title}</h5>
        {
          props.pieces &&
          props.pieces.slice(0,5).map((piece: number[][])=>{
            
            return (
              <>
                <div className="tw-flex tw-flex-col tw-gap-0 tw-justify-center tw-items-center tw-h-16 tw-w-16 tw-m-0">
                {
                  piece.map((row: number[]) => {
                    return (
                      <>
                      <div className={`tw-flex tw-flex-row tw-gap-0 tw-box-content tw-w-${row.length * 4}`}>
                        {
                          row.map((cellValue: number)=>{
                            let ShapeColorsVal = cellValue > 10 ? ShapeColors[cellValue/11] : ShapeColors[cellValue]
                            let cellColor: string =
                              cellValue === 0
                                ? 'tw-bg-transparent'
                                : `tw-border tw-bg-${ShapeColorsVal} tw-border-${ShapeColorsVal} tw-border-outset`;
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

export default PieceQue;