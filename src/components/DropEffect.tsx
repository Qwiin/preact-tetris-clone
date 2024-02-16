import {AnimationDefinition, motion} from 'framer-motion';
import { ConstraintPosition } from '../TetrisConfig';

interface DropEffectProps {
  position: ConstraintPosition;
  onAnimationComplete: (def?: AnimationDefinition) => void;
}

export default function DropEffect(props: DropEffectProps) {
  return (
    <>
    { props.position && 
      // @ts-expect-error
      <motion.div key={props.position.id} className="drop-effect" 
        onAnimationComplete={props.onAnimationComplete}
        variants={{
          show: {
            opacity: 1
          }, 
          hidden: {
            opacity: 0
          }}}
        initial="show"
        animate="hidden"
        transition={{
          duration: 0.25, 
          ease:"easeOut",
          transitionEnd: {
            display: 'none'
          }
        }}
        
        style={{
          top: props.position.top,
          left: props.position.left,
          right: props.position.right,
          bottom: props.position.bottom
        }}/>
      }
    </>
  );
}