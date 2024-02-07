import {AnimationSequence, animate, stagger} from "framer-motion";
import { useState, useEffect } from "preact/hooks";

const backTobackSequence: AnimationSequence = [
  
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
  ],
  [
    ".t-spin", 
    { 
      opacity: 0
    }, 
    { 
      duration: 0.1,
      ease: "easeOut",
      delay: 0.4
    }
  ]
]

interface TSpinProps {
  type: "mini" | "single" | "double" | "triple"
}

export default function TSpin(props: TSpinProps) {

  const [animateType, setAnimateType] = useState(false);

  useEffect(()=>{
    playAnimation();
  },[])

  const playAnimation = () => {
    setAnimateType(true);
    animate(
        ".tspin-flexbox .tspin-char.primary", 
        { 
          transform: ["translateY(0) rotateZ(0deg)","translateY(-50%) rotateZ(-90deg)", "translateY(-100%) rotateZ(-180deg)", "translateY(-50%) rotateZ(-270deg)", "translateY(0%) rotateZ(-360deg)", "translateY(-20%) rotateZ(-360deg)", "translateY(0%) rotateZ(-360deg)"], 
          opacity: [0,1,1,1,1,1,1]
        }, 
        { 
          duration: 0.4,
          ease: "easeIn",
        }
    ).then(()=>{
      animate(backTobackSequence);
    });
  }

  return (

    <div className="t-spin">
      {
        props.type && (

          <h3 key="123" className={`tspin-type ${props.type} ${animateType === true ? 'animate' : ''}`} 
          onAnimationEnd={(e)=>{
            console.log(e);
            document.querySelector('.tspin-type')?.classList.add("show");
          }}>{props.type}</h3>
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
    </div>
  );
}

TSpin.defaultProps = {
  type: "mini"
};