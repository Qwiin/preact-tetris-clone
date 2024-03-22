import { useEffect, useRef } from "preact/hooks";
import { BaseComponentProps } from "../BaseTypes";
import ControlsMap from "./ControlsMap";
import { forwardRef } from "preact/compat";
import { Ref } from "preact";

import { DEFAULT_VOLUME_PCT } from '../TetrisConfig';
import SoundBoard from "./SoundBoard";
import { useGameStore } from "../store/GameStore";
import { useSettingsStore } from "../store/SettingsStore";
import { initialGameState } from "../store/InitialStates";
// import { mobileAndTabletCheck } from "../utils/AppUtil";


export type MenuButtonAction = "restart" | "pause";

const fakeKeyboardEventArgs: [string, any] = ["keydown", {
  view: window,
  bubbles: true,
  cancelable: true,
  key: ''
}];

export const MenuPanel = forwardRef(function MenuPanel(props: BaseComponentProps, soundBoardDomRef: Ref<HTMLDivElement>) {
  // const gameState = useContext(AppContext) as GameStateAPI;
  const [gameState, setGameState] = useGameStore();
  const [settingsState] = useSettingsStore();

  const { gameOver, gamePaused } = gameState;

  const controlsMapRef: Ref<HTMLDivElement> = useRef(null);
  // const [gamePaused, setGamePaused] = useState(gameState.gamePaused);
  // const [gameOver, setGameOver] = useState(gameState.gameOver);
  // const [newTouchEnabled, setNewTouchEnabled] = useState(gameState.props.isNewTouchEnabled);

  useEffect(() => {
    // setGamePaused(gameState.gamePaused);
    // setGameOver(gameState.gameOver);
    // setNewTouchEnabled(gameState.props.isNewTouchEnabled);

    if (controlsMapRef.current) {
      controlsMapRef.current.style.display = settingsState.isNewTouchEnabled ? "none" : 'block';
    }
  }, [gamePaused, gameOver, settingsState.isNewTouchEnabled]);

  const isDesktop = props.layout === 'desktop';

  return (
    <div id={ props.id } data-layout={ props.layout } className="menu-panel" style={ !settingsState.isNewTouchEnabled && !gamePaused && !gameOver ? { zIndex: "5001" } : undefined }>

      <div id="MenuPanelScaleWrapper" style={ { transform: `scale(${props.scale ?? 1})` } }>
        <button className={
          `tetris-font menu-button btn-restart 
            ${(gamePaused === false && gameOver === false) ? 'disabled' : ''}`
        }
          onClick={ () => {
            // props.menuButtonCallback("restart");
            const newState = { ...initialGameState, gameReset: true };
            setGameState(newState);
          } }

          disabled={
            gamePaused === false && gameOver === false
          }>{ gameOver === false ? (isDesktop ? "Restart" : "Restart") : (isDesktop ? "New Game" : "New Game") }</button>
        { true &&
          <button
            className={ `tetris-font btn-pause menu-button pause button ${gameOver ? 'disabled' : ''}` }

            onClick={ () => {

              setGameState({ ...gameState, gamePaused: !gamePaused });


            } }

            disabled={ gameOver }
          >{ (gamePaused && !gameOver) ? (isDesktop ? 'Resume' : 'Resume') : (isDesktop ? 'Pause' : 'Pause') }</button>
        }
        <SoundBoard id="SoundBoard" layout={ props.layout } ref={ soundBoardDomRef } volume={ DEFAULT_VOLUME_PCT } />
        <ControlsMap id="ControlsMap"
          ref={ controlsMapRef }
          layout={ props.layout }
          clickCallback={
            (e: any) => {
              // keydownHandler(e);
              const keyboardEventArgs: [string, any] = [...fakeKeyboardEventArgs];
              keyboardEventArgs[1].key = e.key;
              document.dispatchEvent(new KeyboardEvent(...keyboardEventArgs));
            }
          } />

      </div>
    </div>
  );
});
