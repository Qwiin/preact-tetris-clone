import { useState } from 'preact/hooks'
import './app.css'
import Game from './Game'

export function App() {

  const [action, setAction] = useState("status...");

  const [transitioning, setTransitioning] = useState(false);

  const keyDownCallback = (key) => {
    console.log(key);
  }

  const actionCallback = (action) => {
    setAction(action);
    setTransitioning(true);
    setTimeout(()=>{
      setTransitioning(false);
    },1900);

  }

  return (
    <>
    <div className="tw-bg-slate-700 tw-scale-125 tw-bg-opacity-40">
      <div className={`tw-opacity-1`}>
        <h1 className="tw-m-0 tw-py-2 tw-font-thin game-header tw-text">TETRIS</h1>
      </div>
      <Game init={true} keydownCallback={keyDownCallback} actionCallback={actionCallback}/>
        <div className={`tw-opacity-1 ${ transitioning ? "tw-opacity-1 action-fade-out" : "tw-opacity-0"}`}>
          <h1 className="tw-m-0 tw-py-2 tw-font-thin">{action}</h1>
        </div>
      </div>
    </>
  )
}
