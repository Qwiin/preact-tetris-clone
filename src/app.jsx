import { useRef, useReducer } from 'preact/hooks'
import './app.css'
import Game from './Game'

export function App() {

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // const [transitioning, setTransitioning] = useState(false);

  const actionQue = useRef([]);

  const keyDownCallback = (key) => {
    console.log(key);
  }

  const actionCallback = (a) => {
    
    if(actionQue.current){
      actionQue.current.push({text: a.action, points: a.points, id: Math.round(window.performance.now()).toString(), transitioning: true});
      console.log(JSON.stringify(actionQue.current));
    }
    setTimeout(()=>{
      // setTransitioning(false);
      actionQue.current?.shift();
      forceUpdate(1);
    },2500);
    requestAnimationFrame(() => {
      forceUpdate(1);
    });
  }

  return (
    <>
    <div className="tw-bg-slate-700 tw-scale-125 tw-bg-opacity-40">
      <div className={`tw-opacity-1`}>
        <h1 className="tw-m-0 tw-py-2 tw-font-thin game-header tw-text">TETRIS</h1>
      </div>
      <Game init={true} keydownCallback={keyDownCallback} actionCallback={actionCallback}/>
        <div className='tw-relative tw-w-full tw-h-14'>
          {(actionQue && actionQue.current &&
          actionQue.current.map((a)=>{ return (
            <>
            <div key={a.id} className={`tw-w-full tw-flex tw-justify-center tw-items-center tw-absolute tw-top-0 tw-left tw-opacity-1 ${ a.transitioning ? "tw-opacity-1 action-fade-out" : "tw-opacity-0"}`}>
              <h1 className="tw-m-0 tw-py-2 tw-font-thin">{a.text}</h1>
            </div>
            <div key={a.id + 'b'} className={`tw-font-extrabold tw-font-mono tw-w-full tw-flex tw-justify-center tw-items-center tw-absolute tw-top-0 tw-left tw-opacity-1 ${ a.transitioning ? "tw-opacity-1 action-fade-out2" : "tw-opacity-0"}`}>
              <h2 className="tw-m-0 tw-py-2 tw-font-thin tw-text-green-500">+{a.points}</h2>
            </div>
            </>
          );
          })) }

        </div>
      </div>
    </>
  )
}
