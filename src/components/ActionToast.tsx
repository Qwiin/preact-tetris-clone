import {ActionType, BaseToastDelay, GameAction } from "../TetrisConfig";
import {animate, motion} from "framer-motion";
// import BackToBack from "./BackToBack";
import TSpin from "../TSpin";
// import { pseudoRandom } from "../utils/AppUtil";
import BackToBack from "./BackToBack";
// import { useEffect } from "preact/hooks";


const LABEL_COMBO: string = "COMBO";

const easeOutBounce = (x: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;
  
  if (x < 1 / d1) {
      return n1 * x * x;
  } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
};

const transitionEnd = {
  opacity: 0,
  display: 'none'
};

const textDivVariants = {
    show: {
      transform: "translateY(-150%) scale(100%)",
      opacity: 1
    }, 
    hidden: {
      transform: "translateY(-400%) scale(200%)",
      opacity: 0,
      transitionEnd
    }
};

const pointsDivVariants = {
  show: {
    transform: "translateY(0%) scale(80%)",
    opacity: 1
    
  }, 
  hidden: {
    transform: "translateY(-150%) scale(120%)",
    opacity: 0,
    transitionEnd
  }
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
        onAnimationComplete={()=>{props.toastComplete(id)}}
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

  return (
    <div className="tw-flex tw-items-center tw-h-14 tw-p-0 tw-w-full tw-justify-center">
      <div id="ToastOrigin" className='toast-action-origin'>
      {/* <TSpin id={props.actions && props.actions[0] ? props.actions[0].id || "123" : "123"}  
        animationComplete={props.toastComplete} 
        timestamp={performance.now()/1000}/>   */}
      {renderComboToast({id: "123", combo:2} as GameAction)}  
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
            // @ts-expect-error Motion Component
            <motion.div className="tw-w-full tw-flex tw-font-mono tw-text-amber-600 tw-justify-center tw-items-center tw-absolute tw-top-0 tw-opacity-1"
              key={action.id + "a"} 
              variants={textDivVariants}
              initial="show"
              animate="hidden"
              transition={{
                delay: getDelayForAction(action),
                duration: 2.0, 
                ease: "easeIn"
              }}
              >
              <h2 className="text" data-text={action.text}>{action.text}</h2>
            </motion.div>
          }
          { action.points &&
          // @ts-expect-error Motion Component
          <motion.div className="toast-points"
            onAnimationComplete={()=>{props.toastComplete(action.id)}}
            key={action.id + 'b'} 
            variants={pointsDivVariants}
            initial="show"
            animate="hidden"
            transition={{
              delay: getDelayForAction(action),
              duration: 2.0, 
              ease: "easeIn",
              transitionEnd
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