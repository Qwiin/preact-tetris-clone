import { useEffect, useReducer, useRef } from "preact/hooks"

const NUM_SAMPLES: number = 10;

export function DevPanel() {

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const fps = useRef(0);
  // const timestampPrev = useRef(window.performance.now());
  // const timeoutRef = useRef(0);

  useEffect(()=>{
    const samplingInterval = setInterval(()=>{
      const frameTimes: number[] = [];
      frameAvg(NUM_SAMPLES,frameTimes);
    },2000);

    return ()=>{
      clearInterval(samplingInterval);
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
      fps.current = 1000 / avgTime;
      forceUpdate(1);
    }
  }

  return (
    <div style={{position: "fixed"}} className="tw-top-0 tw-left-0 tw-h-auto tw-w-auto tw-bg-black tw-bg-opacity-30 tw-select-none tw-pointer-events-none">
      <div key="fps" className="tw-flex tw-w-10">
        <h5>FPS:</h5>
        <h5 style={{fontFamily: "Premier2019"}} className={"tw-text-red-600"}>{fps.current}</h5>
      </div>
    </div>
  )
}

