import {ActionType, GameAction } from "../TetrisConfig";
import {motion} from "framer-motion";
// import BackToBack from "./BackToBack";
import TSpin from "../TSpin";

interface ActionToastProps {
  actions: GameAction[];
  toastComplete: (id?: string)=>void;
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

export function ActionToast(props: ActionToastProps) {

  return (
    <div className="tw-flex tw-items-center tw-h-14 tw-p-0 tw-w-full tw-justify-center">
      <div id="ToastOrigin" className='toast-action-origin'>
      {/* <BackToBack/> */}  
      {(props.actions &&
        (props.actions || [{text: "Action", points: "1,000,000"}]).map((action: GameAction)=>{ return (
          <>
          { (
            action.type === ActionType.T_SPIN_MINI ||
            action.type === ActionType.T_SPIN_MINI_SINGLE ||
            action.type === ActionType.T_SPIN_MINI_DOUBLE ||
            action.type === ActionType.T_SPIN ||
            action.type === ActionType.T_SPIN_SINGLE ||
            action.type === ActionType.T_SPIN_DOUBLE ||
            action.type === ActionType.T_SPIN_TRIPLE
            )  &&
              <TSpin type={action.type} id={action.id || 'no_id'} animationComplete={(id)=>{ props.toastComplete(id); }}/>
          }
          
          { action.text &&
            // @ts-expect-error Motion Component
            <motion.div className="tw-w-full tw-flex tw-font-mono tw-text-amber-600 tw-justify-center tw-items-center tw-absolute tw-top-0 tw-opacity-1"
              key={action.id} 
              variants={textDivVariants}
              initial="show"
              animate="hidden"
              transition={{
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
              duration: 2.0, 
              ease: "easeOut"
            }}>
            <h2 className="tw-m-0 tw-py-2 tw-font-thin tw-text-green-500">+{action.points}</h2>
          </motion.div>
          } 
          </>
        );
        }))}
      </div>
    </div>
  );
}

export default ActionToast;