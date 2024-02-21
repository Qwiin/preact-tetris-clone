import { AppLayout, BaseComponentProps, LAYOUT_LANDSCAPE } from "../BaseTypes";
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
  const isLandscape = props.layout === LAYOUT_LANDSCAPE;
  return (
    <div id="MenuPanel" data-layout={props.layout} data-platform={props.platform} className="menu-panel">
        <button className={
          `tetris-font menu-button btn-restart 
           ${(paused === false && gameover === false) ? 'disabled': ''}`
          } 
          onClick={()=>{props.menuButtonCallback("restart")}}
        
        disabled={
          paused === false && gameover === false
          }>{gameover === false ? (isLandscape ? "Restart" : "Restart") : (isLandscape ? "New Game" : "New Game")}</button>
        <button 
          className={`tetris-font btn-pause menu-button pause button ${gameover ? 'disabled' : ''}`} 
    
          disabled={gameover} 
          onClick={()=> {props.menuButtonCallback("pause")}}>{(paused && !gameover) ? (isLandscape ? 'Resume' : 'Resume') : (isLandscape ? 'Pause' : 'Pause')}</button>

        <ControlsMap layout={props.layout} platform={props.platform} clickCallback={props.controlMapCallback}/>
      </div>
  );
}