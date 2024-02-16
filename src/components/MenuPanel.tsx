import { AppLayout } from "../BaseTypes";
import ControlsMap from "./ControlsMap";

export type MenuButtonAction = "restart" | "pause";
interface MenuPanelProps extends BaseComponentProps {
  controlMapCallback: (fakeInputEvent: any) => void;
  menuButtonCallback: (action: MenuButtonAction) => void;
  gameover: boolean;
  paused: boolean;
  layout: AppLayout;
}

export function MenuPanel(props:MenuPanelProps) {
  const {paused, gameover} = props;
  const isDesktop = props.layout === 'desktop';
  return (
    <div id="MenuPanel" data-layout={props.layout} className="menu-panel">
        <button className={
          `tetris-font menu-button btn-restart 
           ${(paused === false && gameover === false) ? 'disabled': ''}`
          } 
          onClick={()=>{props.menuButtonCallback("restart")}}
        
        disabled={
          paused === false && gameover === false
          }>{gameover === false ? (isDesktop ? "Restart" : "Restart") : (isDesktop ? "New Game" : "New Game")}</button>
        <button 
          className={`tetris-font btn-pause menu-button pause button ${gameover ? 'disabled' : ''}`} 
    
          disabled={gameover} 
          onClick={()=> {props.menuButtonCallback("pause")}}>{(paused && !gameover) ? (isDesktop ? 'Resume' : 'Resume') : (isDesktop ? 'Pause' : 'Pause')}</button>

        <ControlsMap layout={props.layout} clickCallback={props.controlMapCallback}/>
      </div>
  );
}