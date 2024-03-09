import { useContext, useEffect, useRef, useState } from "preact/hooks";
import { BaseComponentProps } from "../BaseTypes";
import ControlsMap from "./ControlsMap";
import { AppContext, GameStateAPI } from "../AppProvider";
import { forwardRef } from "preact/compat";
import { Ref } from "preact";

import { DEFAULT_VOLUME_PCT } from '../TetrisConfig';
import SoundBoard from "./SoundBoard";
// import { mobileAndTabletCheck } from "../utils/AppUtil";


export type MenuButtonAction = "restart" | "pause";

const fakeKeyboardEventArgs: [string, any] = ["keydown", {
  view: window,
  bubbles: true,
  cancelable: true,
  key: ''
}];

export const MenuPanel = forwardRef(function MenuPanel(props: BaseComponentProps, soundBoardDomRef: Ref<HTMLDivElement>) {
  const gameState = useContext(AppContext) as GameStateAPI;

  const controlsMapRef: Ref<HTMLDivElement> = useRef(null);
  const [gamePaused, setGamePaused] = useState(gameState.props.gamePaused);
  const [gameOver, setGameOver] = useState(gameState.props.gameOver);
  // const [newTouchEnabled, setNewTouchEnabled] = useState(gameState.props.isNewTouchEnabled);

  useEffect(() => {
    setGamePaused(gameState.props.gamePaused);
    setGameOver(gameState.props.gameOver);
    // setNewTouchEnabled(gameState.props.isNewTouchEnabled);

    if (controlsMapRef.current) {
      controlsMapRef.current.style.display = gameState.props.isNewTouchEnabled ? "none" : 'block';
    }
  }, [gameState.props.gamePaused, gameState.props.gameOver, gameState.props.isNewTouchEnabled]);

  const isDesktop = props.layout === 'desktop';

  return (
    <div id={ props.id } data-layout={ props.layout } className="menu-panel" style={ !gameState.props.isNewTouchEnabled && !gameState.props.gamePaused && !gameState.props.gameOver ? { zIndex: "5001" } : undefined }>

      <div id="MenuPanelScaleWrapper" style={ { transform: `scale(${props.scale ?? 1})` } }>
        <button className={
          `tetris-font menu-button btn-restart 
            ${(gamePaused === false && gameOver === false) ? 'disabled' : ''}`
        }
          onClick={ () => {
            // props.menuButtonCallback("restart");
            gameState.api.resetGame();
          } }

          disabled={
            gamePaused === false && gameOver === false
          }>{ gameOver === false ? (isDesktop ? "Restart" : "Restart") : (isDesktop ? "New Game" : "New Game") }</button>
        { true &&
          <button
            className={ `tetris-font btn-pause menu-button pause button ${gameOver ? 'disabled' : ''}` }

            onClick={ () => {
              if (!gamePaused) {
                gameState.api.pauseGame();
              }
              else {
                gameState.api.resumeGame();
              }

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
