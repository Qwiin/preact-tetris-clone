import {ActionType, BaseToastDelay, GameAction } from "../TetrisConfig";
import {motion} from "framer-motion";
// import BackToBack from "./BackToBack";
import TSpin from "../TSpin";
import { pseudoRandom } from "../utils/AppUtil";
import BackToBack from "./BackToBack";
// import { useEffect } from "preact/hooks";

interface ActionToastProps {
  actions: GameAction[];
  toastComplete: (id?: string)=>void;
  // lastToastId: string;
}



const transitionEnd = {
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
    transform: "translateY(-100%)",
    opacity: 1
    
  }, 
  hidden: {
    transform: "translateY(-300%)",
    opacity: 0,
    transitionEnd
  }
};

// const comboDivVariants = {
//   show: {
//     transform: "translateY(-50%) translateX(0%)",
//     opacity: 1
    
//   }, 
//   hidden: {
//     transform: "translateY(-250%)",
//     opacity: 0,
//     transitionEnd
//   }
// };

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
    
    const {id, combo} = action;


    let tx = pseudoRandom(action.id + 'c')*60 - 30;
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
            transform: `translateX(0%) translateY(-50%)`,
            opacity: 1
            
          }, 
          hidden: {
            transform: `translate(${tx}%) translateY(-250%)`,
            opacity: 0,
            transitionEnd
          }
        }}
        initial="show"
        animate="hidden"
        transition={{
          delay: getDelayForAction(action),
          duration: 2.0, 
          ease: "easeOut",
          transitionEnd
        }}>
        <h2 className=".text">{combo}</h2>
      </motion.div>
    );
  
  }

  return (
    <div className="tw-flex tw-items-center tw-h-14 tw-p-0 tw-w-full tw-justify-center">
      <div id="ToastOrigin" className='toast-action-origin'>
      {/* <TSpin id={props.actions && props.actions[0] ? props.actions[0].id || "123" : "123"}  
        animationComplete={props.toastComplete} 
        timestamp={performance.now()/1000}/>   */}
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
                ease: "easeOut"
              }}
              >
              <h2 className="tw-m-0 tw-py-2 tw-font-thin">{action.text}</h2>
            </motion.div>
          }
          { action.points &&
          // @ts-expect-error Motion Component
          <motion.div className="
            tw-font-extrabold 
            tw-font-mono 
            tw-w-full 
            tw-flex 
            tw-justify-center 
            tw-items-center 
            tw-absolute 
            tw-top-0 
            tw-left 
            tw-opacity-1"
            onAnimationComplete={()=>{props.toastComplete(action.id)}}
            key={action.id + 'b'} 
            variants={pointsDivVariants}
            initial="show"
            animate="hidden"
            transition={{
              delay: getDelayForAction(action),
              duration: 2.0, 
              ease: "easeOut",
              transitionEnd
            }}>
            <h2 className="tw-m-0 tw-py-2 tw-font-thin tw-text-green-500">+{action.points}</h2>
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