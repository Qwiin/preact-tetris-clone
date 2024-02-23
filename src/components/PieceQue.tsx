import { BaseComponentProps } from "../BaseTypes";
import { TETRONIMOES } from "../TetrisConfig";
import { PieceQueItem } from "./Game";
import {motion} from 'framer-motion';

interface PieceQueProps extends BaseComponentProps {
  title: string;
  queLength: number;
  pieces: PieceQueItem[];
  position: "left" | "right";
  disabled: boolean;
  animation: "slideUp" | "spinRight";
  onTap?: () => void;
  id?: string;
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
  ],
  layout: "desktop",
}

export function PieceQue(props: PieceQueProps) {

  return (
    <>
      <div id={props.id} data-layout={props.layout} className={`piece-que-container ${props.position === "left" ? "hold-que" : ""}`} 
      // onTouchEnd={props.onTap !== undefined && props.layout === LAYOUT_MOBILE ? ()=>{ 
      //   props.onTap ? props.onTap() : console.error("onTap() is undefined") } : undefined}
        
      onClick={
        ()=>{ 
          props.onTap ? props.onTap() : console.error("onTap() is undefined") 
        }}>
      
      <h5 className="tw-flex-none tw-relative tw-top-0 tw-h-0 tw-p-0 tw-mb-4 tw-w-full" style={{marginTop: "-0.5rem"}}>{props.title}</h5>
        {
          props.pieces &&
          props.pieces.slice(0,5).map((item: PieceQueItem)=>{
            
            return (
              <>
              {/* @ts-expect-error Motion Component */}
                <motion.div key={item.id} className={`que-item tw-flex tw-flex-col tw-gap-0 tw-justify-center tw-items-center tw-h-16 tw-w-16 tw-m-0`}
                style={{filter: props.disabled ? 'grayscale(1) contrast(0.5)' : undefined}}
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
                            let cellColor: string = (cellValue !== 0)
                                ? `filled-cell cell-color-${cellValue}`
                                : 'tw-bg-transparent'
                            return (
                              <>
                                <div
                                  className={`board-cell ${cellColor} tw-box-border`}
                                  style={{ 
                                    display: "block",
                                    position: "relative",
                                    borderStyle: (cellValue === 0 ? 'none' : 'outset')
                                  }}
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