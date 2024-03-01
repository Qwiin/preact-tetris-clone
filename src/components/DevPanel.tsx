import { useContext, useEffect, useReducer, useRef } from "preact/hooks"
import { AppLayout } from "../BaseTypes";
import { AppContext, GameState, UserContext, UserState } from "../AppProvider";


const NUM_SAMPLES: number = 10;

export function DevPanel(props:{layout: AppLayout, enabled: boolean}) {

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const appContext: GameState = useContext(AppContext);
  // const userContext: UserState = useContext(UserContext);

  const fps = useRef(0);
  // const timestampPrev = useRef(window.performance.now());
  // const timeoutRef = useRef(0);

  // const { gameState } = useContext(AppContext);

  useEffect(()=>{
    if(props.enabled) {
          const samplingInterval = setInterval(()=>{
          const frameTimes: number[] = [];
          frameAvg(NUM_SAMPLES,frameTimes);
        },2000);
      

      return ()=>{
        clearInterval(samplingInterval);
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

  return (
    <>
    {props.enabled && 
      <div data-layout={props.layout}
        style={{position: "fixed"}} className="dev-panel tw-left-0 tw-h-auto tw-w-auto  tw-bg-opacity-30 tw-select-none tw-pointer-events-none">
        <div key="fps" className="field tw-flex tw-w-10" style={{top:`calc(50vh - 10rem);`}}>
          <h5>FPS:</h5>
          <h5 style={{fontFamily: "Premier2019"}} className={"tw-text-red-600"}>{fps.current}</h5>
        </div>
        <div style={{height: "200px", overflow: "scroll", width: "200px"}}>
        {
          JSON.stringify(appContext).split(',').map((el)=>{
            return(<><p style={{width: "5rem"}}>{el}</p></>);
          })
        }
          
        </div>
      </div>

    }
    </>
  )
}

