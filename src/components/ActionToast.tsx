import {ActionType, BaseToastDelay, BoardPosition, GameAction } from "../TetrisConfig";
import {motion} from "framer-motion";
import TSpin from "../TSpin";
import BackToBack from "./BackToBack";
import LineClearToast from "./LineClearToast";

const LABEL_COMBO: string = "COMBO";

const transitionEnd = {
  opacity: 0,
  display: 'none'
};

interface ActionToastProps {
  actions: GameAction[];
  toastComplete: (id?: string)=>void;
  // lastToastId: string;
}

export function ActionToast(props: ActionToastProps) {

  // useEffect(()=>{
  //   if((window as any).confetti)
  //   (window as any).confetti({
  //     particleCount: 100,
  //     spread: 70,
  //     origin: { y: 0.6 },
  //   });
  // },[props.lastToastId]);

  const getDelayForAction = (action: GameAction): number => {
    if(action.timestamp) {
      let delay = BaseToastDelay + action.timestamp - (window.performance.now() / 1000);
      console.log(delay);
      return delay;
    }
    return BaseToastDelay;
  }

  const renderComboToast = (action: GameAction) => {
    
    const {id} = action;

    // let tx = pseudoRandom(action.id + 'c') * 0;
    // let tx = pseudoRandom(action.id + 'c') * 30 - 15;
    // let rx = ["0 deg","0 deg"];
    // let ry = ["0 deg",`${tx/2} deg`];
    // let rz = ["0 deg",`${tx/3} deg`];

    return (
      // @ts-expect-error Motion Component
      <motion.div className="toast-combo"
        onAnimationComplete={()=>{
          console.log({action});
          props.toastComplete(action.id)
        }}
        key={id + 'c'} 
        variants={{
          show: {
            transform: `translateY(-.8rem)`,
            opacity: 0
          }, 
          hidden: {
            transform: `translateY(0rem)`,
            opacity: 1,
            transitionEnd
          }
        }}
        initial={"show"}
        animate={"hidden"}
        
        transition={{
          delay: getDelayForAction(action),
          duration: 2.0, 
          type: "spring",
          damping: 10,
          stiffness: 100,
          
        }}>
        <h2 className="count" data-text={action.combo}>{action.combo}</h2>
        <h2 className="label" data-text={LABEL_COMBO}>{LABEL_COMBO}</h2>
      </motion.div>
    );
  }

  const renderPointsLabels = (action: GameAction) => {

    let comboXY = getXYFromActionPiecePosition(action);

    return (
      <>
      
        <h2 data-text={`+${action.points}`} 
          onAnimationEnd={(e:AnimationEvent)=>{e.stopImmediatePropagation()}}
          className={`${action.backToBack ? 'b2b-pts' : 'std-pts'} ${action.combo ? '' : ''}`}>+{action.points}</h2> 

        { action.combo !== undefined && action.combo > 0 && action.comboPoints !== undefined &&

          <h2 data-text={`+${action.comboPoints}`} 
          onAnimationEnd={(e:AnimationEvent)=>{e.stopImmediatePropagation()}}
          style={{
            position: "absolute",
            width: "4.0rem",
            // height: "2.0rem",

            // dynamically position combo points at the location of the top of the last piece
            left: `${comboXY[0] - 2.0}rem`,
            // top: `${comboXY[1] - 2.0}rem`,
            top: 0,

            lineHeight: "100%",
            padding: 0,
            
          }} 
            className={`combo-pts ${action.combo ? '' : ''}`}>+{action.comboPoints}</h2> 
        }
      </>
    );
  };

  const getYFromActionBoardPosition = (action: GameAction): number => {
    
    let pos: BoardPosition | undefined = (action.boardPositions ? action.boardPositions[0] : undefined);

    if(pos) {
      console.log({pos});
      return (20 - pos.top - ( (pos.height) / 2 ));
    }

    return 0;
  }

  const getXYFromActionPiecePosition = (action: GameAction): number[] => {
    
    let pos: BoardPosition | undefined = action.piecePosition || undefined;

    if(pos) {
      console.log({piecePosition: pos});
      return [(pos.left + pos.width / 2),(20 - pos.top)];
    }

    return [0,0];
  }

  return (
    <div className="tw-flex tw-items-center tw-h-14 tw-p-0 tw-w-full tw-justify-center">
      <div id="ToastOrigin" className='toast-action-origin'>
      {/* <TSpin id={props.actions && props.actions[0] ? props.actions[0].id || "123" : "123"}  
        animationComplete={props.toastComplete} 
        timestamp={performance.now()/1000}/>   */}
      {/* {renderComboToast({id: "123", combo:2} as GameAction)}   */}
      {(props.actions &&
        (props.actions || [{text: "Action", points: "1,000,000"}]).map((action: GameAction) =>{ 
          if(!action) {
            return <></>;
          }
          
          return (
            <>
          { action.backToBack &&
            <>
              <BackToBack animationDelay={getDelayForAction(action)} id={action.id || "12"}/>
            </>
          }
          { (
            action.type === ActionType.T_SPIN_MINI ||
            action.type === ActionType.T_SPIN_MINI_SINGLE ||
            action.type === ActionType.T_SPIN_MINI_DOUBLE ||
            action.type === ActionType.T_SPIN ||
            action.type === ActionType.T_SPIN_SINGLE ||
            action.type === ActionType.T_SPIN_DOUBLE ||
            action.type === ActionType.T_SPIN_TRIPLE
            )  &&
              <TSpin type={ActionType.T_SPIN_MINI_DOUBLE} id={action.id || 'no_id'} animationComplete={props.toastComplete} timestamp={action.timestamp || performance.now()/1000}/>
          }
          
          { action.text && 
           (action.type === ActionType.SINGLE ||
            action.type === ActionType.DOUBLE ||
            action.type === ActionType.TRIPLE ||
            action.type === ActionType.TETRIS) &&
            <LineClearToast  type={action.type} id={action.id || 'no_id'} animationComplete={props.toastComplete} timestamp={action.timestamp || performance.now()/1000}/>

          }
          { action.points &&
          // @ts-expect-error Motion Component
          <motion.div className="toast-points"
            onAnimationComplete={()=>{props.toastComplete(action.id)}}
            key={action.id + 'b'} 
            variants={{
              show: {
                transform: `translateY(${-getYFromActionBoardPosition(action)}rem)`,
                scale: 0.8,
                opacity: 1
                
              }, 
              hidden: {
                transform: `translateY(${-getYFromActionBoardPosition(action)-1.5}rem)`,
                scale: 0.7,
                opacity: 0,
                transitionEnd
              }
            }}
            initial="show"
            animate="hidden"
            transition={{
              delay: getDelayForAction(action),
              duration: 1.0, 
              ease: "easeIn",
            }}>
            <div className={`label labels-wrapper`}>
              {renderPointsLabels(action)}
            </div>

          </motion.div>
          }
          
          { action.combo && renderComboToast(action) }
          </>
        );
        }))}
      </div>
    </div>
  );
}

export default ActionToast;