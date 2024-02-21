import { useEffect, useReducer, useRef } from "preact/hooks"
import { AppLayout, Platform } from "../BaseTypes";
import { Ref } from "preact";

const NUM_SAMPLES: number = 10;

export function DevPanel(props:{layout: AppLayout, platform: Platform, enabled: boolean}) {

  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const samplingInterval: Ref<NodeJS.Timeout> = useRef(null);
  const elRef: Ref<HTMLDivElement> = useRef(null);
  const isMouseDown = useRef(false);
  const tx = useRef(0);
  const ty = useRef(0);

  const fps = useRef(0);
  // const timestampPrev = useRef(window.performance.now());
  // const timeoutRef = useRef(0);

  useEffect(()=>{
    if(props.enabled) {

        samplingInterval.current = setInterval(()=>{
          const frameTimes: number[] = [];
          frameAvg(NUM_SAMPLES,frameTimes);
        },2000);
    }

    return ()=>{
      if(samplingInterval.current){
        clearInterval(samplingInterval.current);
      }
    }
  }, []);

  function frameAvg(n:number=10, frameTimes: number[]) {
  
    if(n>0) {
      requestAnimationFrame(()=>{
        frameTimes.push(performance.now());
        frameAvg(n-1, frameTimes);
      });
    }
    else {
      let avgTime = (frameTimes[frameTimes.length-1] - frameTimes[0]) / (frameTimes.length - 1);
      // console.log(avgTime);
      fps.current = Math.round(10000 / avgTime) / 10;
      forceUpdate(1);
    }
  }

  const dragHandler = (e:MouseEvent) => {
    if(!elRef.current || !isMouseDown.current){
      return;
    }
    tx.current = (tx.current ?? 0) + e.movementX;
    ty.current = (ty.current ?? 0) + e.movementY;
    elRef.current.style.transform = `translate(${tx.current}px,${ty.current}px)`;
  }
  const dragEndHandler = () => {  
    isMouseDown.current = false;
    window.removeEventListener("mousemove", dragHandler);
    window.removeEventListener("mouseup", dragEndHandler);
  }

  return (
    <>
    {props.enabled && 
      <div ref={elRef} data-layout={props.layout} data-platform={props.platform}
        onMouseDown={()=>{
          isMouseDown.current = true;
          window.addEventListener("mouseup", dragEndHandler);
          window.addEventListener("mousemove", dragHandler);
        }}
        className="dev-panel">
        <div key="fps" className="field tw-flex tw-w-10" style={{top:`calc(50vh - 10rem);`}}>
          <h5>FPS:</h5>
          <h5 style={{fontFamily: "Premier2019"}} className={"tw-text-red-600"}>{fps.current}</h5>
        </div>
        <div key="platform" className="field tw-flex tw-w-10" style={{top:`calc(50vh - 10rem);`}}>
          <h5>Platform:</h5>
          <h5 style={{fontFamily: "Premier2019"}} className={"tw-text-red-600"}>{props.platform}</h5>
        </div>
        <div key="layout" className="field tw-flex tw-w-10" style={{top:`calc(50vh - 10rem);`}}>
          <h5>Layout:</h5>
          <h5 style={{fontFamily: "Premier2019"}} className={"tw-text-red-600"}>{props.layout}</h5>
        </div>
      </div>
    }
    </>
  )
}

