import {animate} from "framer-motion";
import { useState, useEffect } from "preact/hooks";
import { ActionType, BaseToastDelay, getLabelForActionType } from "../TetrisConfig";

interface LineClearToastProps {
  // type: "mini" | "single" | "double" | "triple"
  type: ActionType.SINGLE | ActionType.DOUBLE | ActionType.TRIPLE | ActionType.TETRIS

  id: string;
  timestamp: number;
  animationComplete: (id: string) => void;
}

export default function LineClearToast(props: LineClearToastProps) {

  const [animateType, setAnimateType] = useState(false);

  useEffect(()=>{
    playAnimation();
  },[props.id])

  const playAnimation = () => {
    if(props.type === ActionType.TETRIS) {
      setAnimateType(true);
      animate(
          ".tetris-flexbox .tetris-label", 
          { 
            transform: ["translateY(50%)","translateY(-25%)", "translateY(-100%)", "translateY(-50%)", "translateY(0%)", "translateY(-20%)", "translateY(0%)"], 
            opacity: [0,1,1,1,1,1,1]
          }, 
          { 
            delay: BaseToastDelay + (props.timestamp - (performance.now() / 1000)),
            duration: 0.4,
            ease: "easeOut",
          }
      ).then(()=>{
          
        document.querySelector('.tetris-flexbox')?.classList.add("flash");
        
        requestAnimationFrame(()=>{
          animate(
            ".line-clear-toast", 
            { 
              opacity: 0,
              scale: 0,
            }, 
            { 
              duration: 0.3,
              ease: "easeOut",
              delay: 0.5
            }
          ).then(()=>{
            
            document.querySelector('.tetris-flexbox')?.classList.remove("flash");
            props.animationComplete(props.id);
          });
        });
      });
    }
    else {
      document.querySelector('.line-clear-type')?.classList.add("show","flash");

      requestAnimationFrame(()=>{
        animate(
          ".line-clear-toast", 
          { 
            opacity: 0,
            // scale: 0,
          }, 
          { 
            duration: 0.3,
            ease: "easeOut",
            delay: 0.5
          }
        ).then(()=>{
          
          document.querySelector('.line-clear-type')?.classList.remove("show","flash");
          props.animationComplete(props.id);
        });
      });
    }
  }

  const lineClearLabel: string = getLabelForActionType(props.type);
  
  return (

    <div key={props.id} className="line-clear-toast">
      
    {/* TETRIS */}
    { lineClearLabel && props.type === ActionType.TETRIS && (
        <div className="tetris-flexbox" data-chars={lineClearLabel} key="abc">
          <div className="tetris-label primary" data-char={lineClearLabel} key="abc1">{lineClearLabel}</div>
        </div>
      )
    }

    {/* SINGLE DOUBLE TRIPLE */}
    { lineClearLabel && props.type !== ActionType.TETRIS &&
        (
          <h3 key={`${props.id + 'b'}`} 
          data-chars={lineClearLabel} 
          style={{transform: "translateY(-100%) scale(120%)"}}
          className={`line-clear-type ${lineClearLabel.toLowerCase()} ${animateType === true ? 'animate' : ''}`} 
          >{lineClearLabel}</h3>
        )
      }
    </div>
  );
}

LineClearToast.defaultProps = {
  type: ActionType.TETRIS,
};