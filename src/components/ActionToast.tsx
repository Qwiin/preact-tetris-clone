import { GameAction } from "../TetrisConfig";
import {motion} from "framer-motion";

interface ActionToastProps {
  actions: GameAction[];
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
const subtextDivVariants = {
    show: {
      transform: "rotateY(90deg)",
      opacity: 1
    }, 
    hidden: {
      transform: "rotateY(0deg)",
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
      <div className='tw-relative tw-w-80 tw-h-14 tw-max-w-80'>
        {(props.actions &&
        (props.actions || [{text: "Action", points: "1,000,000"}]).map((action: GameAction)=>{ return (
          <>
          {/* @ts-expect-error Motion Component */}
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
          {/* @ts-expect-error Motion Component */}
          <motion.div className="tw-font-extrabold tw-font-mono tw-w-full tw-flex tw-justify-center tw-items-center tw-absolute tw-top-0 tw-left tw-opacity-1"
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
          {/* @ts-expect-error Motion Component */}
          <motion.div className="tw-absolute tw-right-0 tw-top-0 tw-font-extrabold tw-font-mono tw-w-full tw-flex tw-justify-center tw-items-center tw-opacity-1"
            key={action.id + 'c'} 
            variants={subtextDivVariants}
            initial="show"
            animate="hidden"
            transition={{
              duration: 2.0, 
              ease: "easeOut"
            }}>
            <h2 className="tw-m-0 tw-py-0 tw-font-bold tw-text-blue-500">{action.subtext}</h2>
          </motion.div>
          </>
        );
        }))}
      </div>
    </div>
  );
}

export default ActionToast;