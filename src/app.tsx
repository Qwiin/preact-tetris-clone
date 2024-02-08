import { Ref } from 'preact';
import { useReducer, useRef } from 'preact/hooks';
import { GameAction, ToastTimeout } from './TetrisConfig';
import './app.css';
import ActionToast from './components/ActionToast';
import Game from './components/Game';
import SoundBoard from './components/SoundBoard';
import './checkbox.css';

const fakeMouseEventArgs:[string, any] = ["click",{
  view: window,
  bubbles: true,
  cancelable: true,
  buttons: 0,
}];

export function App() {

  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const soundBoardDomRef:Ref<HTMLDivElement> = useRef(null);
  const actionQue: Ref<GameAction[]> = useRef([]);

  const actionCallback = (a: GameAction) => {
    
    if (a.text || a.subtext || a.toast) {

      if(actionQue.current){
        actionQue.current.push({
          type: a.type,
          text: a.text, 
          subtext: a.subtext,
          points: a.points, 
          id: Math.round(window.performance.now()).toString(), 
          transitioning: true
        });
        console.log(JSON.stringify(actionQue.current));
      }
      setTimeout(()=>{
        // setTransitioning(false);
        if(actionQue.current) {
          actionQue.current = actionQue.current.filter(action => {
            if(action === null || action === undefined) {
              return false;
            }
            return true;
          });
        }
        // forceUpdate(1);
      },ToastTimeout);
      requestAnimationFrame(() => {
        forceUpdate(1);
      });
    }

    const mouseEventArgs:[string, any] = [...fakeMouseEventArgs];
    mouseEventArgs[1].buttons = a.type;
    soundBoardDomRef.current?.dispatchEvent(new MouseEvent(...mouseEventArgs));
    
  }

  return (
    <>
      <div className="tw-bg-slate-700 tw-scale-125 tw-bg-opacity-30">
        <div className={`tw-opacity-1`}>
          <h1 className="tw-m-0 tw-py-2 tw-font-thin game-header">TETRIS</h1>
        </div>

        {/* @ts-expect-error Preact Component */}
        <Game init={true} actionCallback={actionCallback}/>
        <ActionToast actions={actionQue.current || []} toastComplete={(action: GameAction)=>{
          if(!actionQue.current) {
            return;
          }
          for(let i=0; i<actionQue.current.length; i++) {
            if(actionQue.current[i].id === action.id) {
              actionQue.current.splice(i,1);
              break;
            }
          }

        }}/>  
        <SoundBoard eventTargetRef={soundBoardDomRef} volume={50}/>
      </div>
      
    </>
  )
}
