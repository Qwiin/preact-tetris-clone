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
              ".b2b-grid div",
              {
                scale: [0.5,1.0], 
                opacity: [1.0,1.0]
              },
              {
                duration: 0.3
              }
            );
            animate(
              ".b2b-grid", 
              { 
                gridTemplateColumns: [
                  "0.375rem 1.5rem 0.375rem",
                  "1.9rem 1.5rem 1.975rem"
                ],
              }, 
              { 
                // type: "spring",
                // damping: 10,
                // stiffness: 50, 
                duration: 0.3,
                
              }
            )
            .then(()=>{

              // .then(()=>{
              setTimeout(()=>{
                document.querySelectorAll('.b2b-grid .hyphen').forEach(el => {
                  el.classList.add("show");
                });
                document.querySelector('.b2b-grid')?.classList.add("flash");
                
                animate(
                  ".b2b-grid", 
                  { 
                    scale: 0
                  }, 
                  { 
                    ease: "easeIn", 
                    delay: 1.0,
                    duration: 0.2,
                  }
                );
                
              },0);              
            })
          });
        }
      }
    >
      <div className="b2b-grid" key="abc" data-chars="Back-to-Back">
          <div className="cell c1" key="abc1">Back<span className="hyphen">-</span></div>
          <div className="cell c2" key="abc2">to</div>
          <div className="cell c3" key="abc3"><span className="hyphen">-</span>Back</div>  
        </div>
    </div>
  );
}