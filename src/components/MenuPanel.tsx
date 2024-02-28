import { useContext } from "preact/hooks";
import { AppLayout, BaseComponentProps } from "../BaseTypes";
import ControlsMap from "./ControlsMap";
import { AppContext, GameStateAPI } from "../AppProvider";

export type MenuButtonAction = "restart" | "pause";
interface MenuPanelProps extends BaseComponentProps {
  // controlMapCallback: (fakeInputEvent: any) => void;
  // menuButtonCallback: (action: MenuButtonAction) => void;
  gameover: boolean;
  paused: boolean;
  layout: AppLayout;
}

const fakeKeyboardEventArgs:[string, any] = ["keydown",{
  view: window,
  bubbles: true,
  cancelable: true,
  key: ''
}];

export function MenuPanel(props:MenuPanelProps) {
  const {paused, gameover} = props;
  const isDesktop = props.layout === 'desktop';
  const appState = useContext(AppContext) as GameStateAPI;
  return (
    <div id="MenuPanel" data-layout={props.layout} className="menu-panel">
        <button className={
          `tetris-font menu-button btn-restart 
           ${(paused === false && gameover === false) ? 'disabled': ''}`
          } 
          onClick={()=>{
            // props.menuButtonCallback("restart");
            appState.restartGame();
          }}
        
        disabled={
          paused === false && gameover === false
          }>{gameover === false ? (isDesktop ? "Restart" : "Restart") : (isDesktop ? "New Game" : "New Game")}</button>
        <button 
          className={`tetris-font btn-pause menu-button pause button ${gameover ? 'disabled' : ''}`} 
    
          onClick={()=> { 
            appState.pauseGame();
            // props.menuButtonCallback("pause")
          }}
            
          disabled={appState.gameOver} 
            >{(paused && !gameover) ? (isDesktop ? 'Resume' : 'Resume') : (isDesktop ? 'Pause' : 'Pause')}</button>

        <ControlsMap layout={props.layout} clickCallback={
            (e: any)=>{
              // keydownHandler(e);
              const keyboardEventArgs: [string, any] = [...fakeKeyboardEventArgs];
              keyboardEventArgs[1].key = e.key;
              document.dispatchEvent(new KeyboardEvent(...keyboardEventArgs));
            } 
          }/>
      </div>
  );
}