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

  const getYFromActionBoardPosition = (action: GameAction): number => {
    
    let pos: BoardPosition | undefined = (action.boardPositions ? action.boardPositions[0] : undefined);

    if(pos) {
      return (20 - pos.top - ( (pos.height) / 2 ));
      console.log({pos});
    }

    return 0;
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
            // // @ts-expect-error Motion Component
            // <motion.div className="tw-w-full tw-flex tw-font-mono tw-text-amber-600 tw-justify-center tw-items-center tw-absolute tw-top-0 tw-opacity-1"
            //   key={action.id + "a"} 
            //   variants={textDivVariants}
            //   initial="show"
            //   animate="hidden"
            //   transition={{
            //     delay: getDelayForAction(action),
            //     duration: 2.0, 
            //     // ease: "easeIn"
            //     type: "spring",
            //     damping: 30,
            //     stiffness: 50,
            //   }}
            //   >
            //   <h2 className="text" data-text={action.text}>{action.text}</h2>
            // </motion.div>
          }
          { action.points &&
          // @ts-expect-error Motion Component
          <motion.div className="toast-points"
            onAnimationComplete={()=>{props.toastComplete(action.id)}}
            key={action.id + 'b'} 
            variants={{
              show: {
                transform: `translateY(${-getYFromActionBoardPosition(action)}rem) scale(64%)`,
                opacity: 1
                
              }, 
              hidden: {
                transform: `translateY(${-getYFromActionBoardPosition(action)-1.5}rem) scale(64%)`,
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
            <h2 className="text" data-text={`+${action.points}`}>+{action.points}</h2>
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