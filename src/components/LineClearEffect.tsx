import { AnimationDefinition, motion} from "framer-motion";
import { ConstraintPosition } from "../TetrisConfig";

interface LineClearEffectProps {
  positions: ConstraintPosition[];
  onAnimationComplete: (def?: AnimationDefinition) => void;
}

export default function LineClearEffect(props: LineClearEffectProps) {
  return (
    <>
    {
      props.positions && 
      props.positions.map((effect: any)=>{
        return  (
        // @ts-expect-error
        <motion.div key={effect.id} className="clear-effect" 
          onAnimationComplete={props.onAnimationComplete}
          variants={{
            show: {
              opacity: 1,
              transform: 'rotateX(0)'
            }, 
            hidden: {
              opacity: 0,
              transform: 'rotateX(90deg)',
              transitionEnd: {
                display: 'none'
              }
            }}}
          initial="show"
          animate="hidden"
          transition={{
            duration: 0.4, 
            ease:"easeOut",
            delay: 0.1,
          }}
          style={{
            top: effect.top,
            left: effect.left,
            right: effect.right,
            bottom: effect.bottom
            }}/>
        );
      })
    }
    </>
  )
}