import { TETRONIMOES, ShapeColors } from "../TetrisConfig";
import { PieceQueItem } from "./Game";
import {motion} from 'framer-motion';

interface PieceQueProps {
  title: string;
  queLength: number;
  pieces: PieceQueItem[];
  position: "left" | "right";
  disabled: boolean;
  animation: "slideUp" | "spinRight";
}

const defaultPropsPieceQue: PieceQueProps = {
  animation: "slideUp",
  disabled: false,
  position: "right",
  title: "Que",
  queLength: 5,
  pieces: [
    {shapeEnum: 0, id: "1"},
    {shapeEnum: 0, id: "2"},
    {shapeEnum: 0, id: "3"},
    {shapeEnum: 0, id: "4"},
    {shapeEnum: 0, id: "5"},
    {shapeEnum: 0, id: "6"},
    {shapeEnum: 0, id: "7"}
  ]
}

export function PieceQue(props: PieceQueProps) {

  // const piecesPrev: Ref<PieceQueItem[]> = useRef([]);

  // useEffect(()=>{

  //   if(props.pieces && (piecesPrev.current && piecesPrev.current[0] !== props.pieces[0])) {
  //     if(!piecesPrev.current) {piecesPrev.current = [];}
  //     piecesPrev.current.length = 0;
  //     piecesPrev.current.push(...props.pieces);
  //     console.log({props});
  //   }
  // });

  return (
    <>
      <div className={`tw-overflow-y-hidden tw-box-border tw-flex tw-relative tw-flex-col tw-w-24 tw-items-center tw-justify-start tw-gap-0 tw-mt-0 tw-bg-black tw-rounded-xl tw-pt-4 tw-pb-8"}`} 
      style={{
        transform: `translateX(${props.position === "left" ? 25 : -25}%) translateY(-20%) scale(60%)`, 
        zIndex:"-1", 
        border:"1.67px solid rgba(255,255,255,0.8)", 
        height: (props.position === "left" ? "6rem" : "22rem"), 
        paddingRight: (props.position === "right" ? "0.5rem" : "0.75rem"), 
        paddingLeft: (props.position === "right" ? "0.75rem" : "0.5rem"), 
        borderTopLeftRadius: (props.position === "right" ? "0" : undefined), 
        borderBottomLeftRadius: (props.position === "right" ? "0" : undefined),
        borderTopRightRadius: (props.position === "left" ? "0" : undefined), 
        borderBottomRightRadius: (props.position === "left" ? "0" : undefined),
        marginBottom: props.position === "left" ? `${16}rem` : `${0}rem`
      }}>
      <h5 className="tw-flex-none tw-relative tw-top-0 tw-h-0 tw-p-0 tw-mb-4 tw-w-full" style={{marginTop: "-0.5rem"}}>{props.title}</h5>
        {
          props.pieces &&
          props.pieces.slice(0,5).map((item: PieceQueItem)=>{
            
            return (
              <>
              {/* @ts-expect-error Motion Component */}
                <motion.div key={item.id} className={`que-item tw-flex tw-flex-col tw-gap-0 tw-justify-center tw-items-center tw-h-16 tw-w-16 tw-m-0`}
                style={{filter: props.disabled ? 'grayscale(1)' : undefined}}
                variants={{
                  show: {
                    transform: props.animation === "slideUp" 
                      ? "translateY(0)" 
                      : props.animation === "spinRight" 
                        ? "rotateZ(0deg)"
                        : "none"
                  }, 
                  hidden: {
                    transform: props.animation === "slideUp" 
                    ? "translateY(3.84rem)" 
                    : props.animation === "spinRight" 
                      ? "rotateZ(-360deg)"
                      : "none"
                  }}}
                  initial="hidden"
                  animate="show"
                  transition={{
                    duration: 0.3, 
                    ease:"easeOut"
                  }}
                  >
                {
                  TETRONIMOES[item.shapeEnum].map((row: number[]) => {
                    return (
                      <>
                      
                      <div className={`tw-flex tw-flex-row tw-gap-0 tw-box-content tw-w-${row.length * 4}`}>
                        {
                          row.map((cellValue: number)=>{
                            let ShapeColorsVal = cellValue > 10 ? ShapeColors[cellValue/11] : ShapeColors[cellValue]
                            let cellColor: string =
                              cellValue === 0
                                ? 'tw-bg-transparent'
                                : `filled-cell tw-bg-${ShapeColorsVal} tw-border-${ShapeColorsVal}`;
                            return (
                              <>
                                <div
                                  className={`board-cell ${cellColor} tw-box-border`}
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
                </motion.div>
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