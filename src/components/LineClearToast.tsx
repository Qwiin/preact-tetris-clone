import {animate} from "framer-motion";
import { useState, useEffect, useRef } from "preact/hooks";
import { ActionType, BaseToastDelay, getLabelForActionType } from "../TetrisConfig";
import { Ref } from "preact";

interface LineClearToastProps {
  // type: "mini" | "single" | "double" | "triple"
  type: ActionType.SINGLE | ActionType.DOUBLE | ActionType.TRIPLE | ActionType.TETRIS

  id: string;
  timestamp: number;
  animationComplete: (id: string) => void;
}

export default function LineClearToast(props: LineClearToastProps) {

  const tetrisFlexbox: Ref<HTMLDivElement> = useRef(null);
  const tetrisLabel: Ref<HTMLDivElement> = useRef(null);
  const lineClearTypeRef: Ref<HTMLDivElement> = useRef(null);

  useEffect(()=>{
    playAnimation();
  },[props.id])

  const playAnimation = async () => {
    if(props.type === ActionType.TETRIS) {
      await animate(
          ".tetris-flexbox .tetris-label", 
          { 
            transform: ["translateY(50%)","translateY(-25%)", "translateY(-100%)", "translateY(-50%)", "translateY(0%)", "translateY(-20%)", "translateY(0%)"], 
            opacity: [0,1,1,1,1,1,1]
          }, 
          { 
            delay: BaseToastDelay + (props.timestamp - (performance.now() / 1000)),
            duration: 0.5,
            ease: "easeOut",
          }
      )
          
      tetrisFlexbox.current?.classList.add("flash");
      
      await animate(
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
      )
            
      tetrisFlexbox.current?.classList.remove("flash");
          
      props.animationComplete(props.id);
    }
    else {
      lineClearTypeRef.current?.classList.add("show","flash");

      await animate(
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
      )
          
      lineClearTypeRef.current?.classList.remove("show","flash");
      props.animationComplete(props.id);
    }
  }

  const lineClearLabel: string = getLabelForActionType(props.type);
  
  return (
    <>
    <div key={props.id} className="line-clear-toast">
      
    {/* TETRIS */}
    { lineClearLabel && props.type === ActionType.TETRIS && (
        <div ref={tetrisFlexbox} className="tetris-flexbox" data-chars={lineClearLabel}  key={`${props.id + 'tfb'}`}>
          <div ref={tetrisLabel} className="tetris-label primary" data-char={lineClearLabel}  key={`${props.id + 'tlc'}`}>{lineClearLabel}</div>
        </div>
      )
    }

    {/* SINGLE DOUBLE TRIPLE */}
    { lineClearLabel && props.type !== ActionType.TETRIS &&
        (
          <h3 key={`${props.id + 'b'}`} 
          ref={lineClearTypeRef}
          data-chars={lineClearLabel} 
          style={{transform: "translateY(-100%) scale(120%)"}}
          className={`line-clear-type ${lineClearLabel.toLowerCase()}`} 
          >{lineClearLabel}</h3>
        )
      }
    </div>
    </>
  );
}

LineClearToast.defaultProps = {
  type: ActionType.TETRIS,
};