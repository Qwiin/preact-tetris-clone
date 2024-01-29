import { useRef, useReducer } from 'preact/hooks'
import './app.css'
import Game from './Game'
import { GameAction, ToastTimeout } from './TetrisConfig';
import { Ref } from 'preact';
import ActionToast from './components/ActionToast';

export function App() {

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // const [transitioning, setTransitioning] = useState(false);

  const actionQue: Ref<GameAction[]> = useRef([]);

  const keyDownCallback = (key: string) => {
    console.log(key);
  }

  const actionCallback = (a: GameAction) => {
    
    if(actionQue.current){
      actionQue.current.push({
        text: a.text, 
        points: a.points, 
        id: Math.round(window.performance.now()).toString(), 
        transitioning: true
      });
      console.log(JSON.stringify(actionQue.current));
    }
    setTimeout(()=>{
      // setTransitioning(false);
      actionQue.current?.shift();
      forceUpdate(1);
    },ToastTimeout);
    requestAnimationFrame(() => {
      forceUpdate(1);
    });
  }

  return (
    <>
      <div className="tw-bg-slate-700 tw-scale-125 tw-bg-opacity-40">
        <div className={`tw-opacity-1`}>
          <h1 className="tw-m-0 tw-py-2 tw-font-thin game-header">TETRIS</h1>
        </div>
        {/* @ts-expect-error Server Component */}
        <Game init={true} keydownCallback={keyDownCallback} actionCallback={actionCallback}/>
        <ActionToast actions={actionQue.current || []}/>  
      </div>
    </>
  )
}
