import {AnimationSequence, animate, stagger} from "framer-motion";
import { useState, useEffect } from "preact/hooks";
import { BaseToastDelay, ActionType as TSType } from "./TetrisConfig";

const tSpinCharSequence: AnimationSequence = [
  
  [
    ".tspin-flexbox .tspin-char.secondary", 
    { 
      transform: ["translateY(0)","translateY(0)", "translateY(-50%)", "translateY(0%)","translateY(-10%)", "translateY(0%)"],
      opacity: [0,1,1,1,1,1]
    }, 
    { 
      duration: 0.5,
      delay: stagger(0.1),
      ease: "easeOut",
    }
  ]
]

interface TSpinProps {
  // type: "mini" | "single" | "double" | "triple"
  type:  TSType.T_SPIN_MINI
            | TSType.T_SPIN_MINI_SINGLE
            | TSType.T_SPIN_MINI_DOUBLE
            | TSType.T_SPIN
            | TSType.T_SPIN_SINGLE
            | TSType.T_SPIN_DOUBLE
            | TSType.T_SPIN_TRIPLE;

  id: string;
  timestamp: number;
  animationComplete: (id: string) => void;
}

export default function TSpin(props: TSpinProps) {

  const [animateType, setAnimateType] = useState(false);

  useEffect(()=>{
    playAnimation();
  },[props.id])

  const playAnimation = () => {
    setAnimateType(true);
    animate(
        ".tspin-flexbox .tspin-char.primary", 
        { 
          transform: ["translateY(0) rotateZ(0deg)","translateY(-50%) rotateZ(-90deg)", "translateY(-100%) rotateZ(-180deg)", "translateY(-50%) rotateZ(-270deg)", "translateY(0%) rotateZ(-360deg)", "translateY(-20%) rotateZ(-360deg)", "translateY(0%) rotateZ(-360deg)"], 
          opacity: [0,1,1,1,1,1,1]
        }, 
        { 
          delay: BaseToastDelay + (props.timestamp - (performance.now() / 1000)),
          duration: 0.4,
          ease: "easeIn",
        }
    ).then(()=>{

      animate(tSpinCharSequence).then(()=>{
        document.querySelector('.tspin-type')?.classList.add("flash");
        document.querySelector('.tspin-flexbox')?.classList.add("flash");
        document.querySelector('.line-clear-type')?.classList.add("show","flash");

        requestAnimationFrame(()=>{
          animate(
            ".t-spin", 
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
            document.querySelector('.tspin-type')?.classList.remove("flash");
            document.querySelector('.tspin-flexbox')?.classList.remove("flash");
            document.querySelector('.line-clear-type')?.classList.remove("show","flash");
            props.animationComplete(props.id);
          })
        });
      });
    });
  }

  const isMini = () => {
    switch(props.type) {
      case TSType.T_SPIN_MINI:
      case TSType.T_SPIN_MINI_SINGLE:
      case TSType.T_SPIN_MINI_DOUBLE:
        return true;
    }

    return false;
  }

  const getLineClearLabel = (): string => {
    switch(props.type) {
      case TSType.T_SPIN_MINI_SINGLE:
      case TSType.T_SPIN_SINGLE:
        return "Single";
        break;
      case TSType.T_SPIN_MINI_DOUBLE:
      case TSType.T_SPIN_DOUBLE:
        return "Double";
        break;
      case TSType.T_SPIN_TRIPLE:
        return "Triple";
        break;
      default:
        return "";
    }
  }

  let lineClearLabel = getLineClearLabel();
  
  return (

    <div key={props.id} className="t-spin">
      {
        isMini() && (
          <h3 key={`${props.id + 'a'}`} data-chars="Mini" className={`tspin-type mini ${animateType === true ? 'animate' : ''}`} 
          onAnimationEnd={(e)=>{
            console.log(e);
            document.querySelector('.tspin-type')?.classList.add("show");
          }}>Mini</h3>
        )
      }

      <div className="tspin-flexbox" data-chars="T-Spin" key="abc">
        <div className="tspin-char primary" data-char="T" key="abc1">T</div>
        <div className="tspin-char secondary hyphen" data-char="-" key="abc2"><div className="hyphen-span">-</div></div>
        <div className="tspin-char secondary" data-char="S" key="abc3">S</div>  
        <div className="tspin-char secondary" data-char="p" key="abc4">p</div>  
        <div className="tspin-char secondary" data-char="i" key="abc5">i</div>  
        <div className="tspin-char secondary" data-char="n" key="abc6">n</div>  
      </div>

      {
        lineClearLabel && (
          <h3 key={`${props.id + 'b'}`} data-chars={lineClearLabel} className={`line-clear-type ${lineClearLabel.toLowerCase()} ${animateType === true ? 'animate' : ''}`} 
          >{lineClearLabel}</h3>
        )
      }
    </div>
  );
}

TSpin.defaultProps = {
  type: TSType.T_SPIN_MINI_SINGLE,
};