import {AnimationPlaybackControls, AnimationSequence, animate} from "framer-motion";

const backTobackSequence: AnimationSequence = [
  [
    ".b2b-grid .c1", 
    { 
      scale: [0.0,2.0,0.0], 
      opacity: [1,1,0]
    }, 
    { 
      type: "spring",
      damping: 10,
      stiffness: 50,
      duration: 0.5,
    }
  ],
  [
    ".b2b-grid .c2", 
    { 
      scale: [0.0,2.0,0.0],
      opacity: [1,1,0]
    }, 
    { 
      type: "spring",
      damping: 10,
      stiffness: 50,
      duration: 0.5,
    }
  ],
  [
    ".b2b-grid .c3", 
    { 
      scale: [0.0,2.0,0.0],
      opacity: [1,1,0]
    }, 
    { 
      type: "spring",
      damping: 10,
      stiffness: 50,
      duration: 0.5,
      onUpdate: (value)=>{
        console.log({value});
      }
    }
  ]
]

export default function BackToBack() {
  return (

    <div className="back-to-back tw-flex tw-items-center tw-justify-center" 
      onClick={
        ()=>{
          const animation:AnimationPlaybackControls = animate(backTobackSequence);
          animation.then(()=>{
            animate(
              ".b2b-grid", 
              { 
                gridTemplateColumns: [
                  "0.375rem 1rem 0.375rem",
                  "2rem 1rem 2rem"
                ],
              }, 
              { 
                type: "spring",
                damping: 10,
                stiffness: 50, 
                duration: 0.5,
                
              }
            );
            animate(
              ".b2b-grid div",
              {
                scale: [0.5,1.0], 
                opacity: [1.0,1.0]
              },
              {
                duration: 0.5
              }
            ).then(()=>{
              animate(
                ".b2b-grid", 
                { 
                  scale: 0
                }, 
                { 
                  ease: "easeIn", 
                  delay: 0.5,
                  duration: 0.2,
                }
              );
            })
          });
        }
      }
    >
      <div className="b2b-grid" key="abc">
          <div className="c1" key="abc1">Back</div>
          <div className="c2" key="abc2">to</div>
          <div className="c3" key="abc3">Back</div>  
        </div>
    </div>
  );
}