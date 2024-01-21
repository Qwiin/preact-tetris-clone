import { useEffect } from 'preact/hooks'
import './app.css'
import Game from './Game'

export function App() {

  const keyDownCallback = (key:string) => {
    console.log(key);
  }

  return (
    <>
    <div className="tw-bg-green-500">
      <Game init={true} keydownCallback={keyDownCallback}/>
      </div>
    </>
  )
}
