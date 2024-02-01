import { useRef, useReducer, useState } from 'preact/hooks'
import './app.css'
import Game from './components/Game'
import { ActionType, GameAction, ToastTimeout } from './TetrisConfig';
import { Ref } from 'preact';
import ActionToast from './components/ActionToast';

// @ts-expect-error
import {useSound} from 'use-sound';

import audio_movePiece from '@sounds/mixkit-game-ball-tap-2073.wav';
import audio_dropPiece from '@sounds/sci-fi-gun-shot-x6-14447.mp3'
import audio_levelUp from '@sounds/mixkit-bonus-earned-in-video-game-2058.wav';
import audio_rotate from '@sounds/click-button-140881.mp3'
import audio_lineClear from '@sounds/game-ui-sounds-14857.mp3'
import audio_tetris from '@sounds/dark-boom-139891.mp3'
import audio_gameOver from '@sounds/dramatic-synth-echo-43970.mp3'

const fakeMouseEventArgs:[string, any] = ["click",{
  view: window,
  bubbles: true,
  cancelable: true,
  buttons: 1,
}];

export function App() {

  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const btn: Ref<HTMLDivElement> = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [sfx_movePiece] = useSound(audio_movePiece, {
    volume: 0.2,
    playbackRate: 1,
  });
  const [sfx_dropPiece] = useSound(audio_dropPiece, {
    sprite: {
      drop: [1720, 1800],
      // click: [1500, 2000],
    },
    volume: 0.6,
    playbackRate: 1.3,
    // interrupt: true
  });
  const [sfx_levelUp] = useSound(audio_levelUp, {
    volume: 0.5,
    playbackRate: 1
  });
  const [sfx_rotate] = useSound(audio_rotate, {
    sprite: {
      click: [0, 200],
      // click: [1500, 2000],
    },
    volume: 0.2,
    playbackRate: 2.0
  });
  const [sfx_lineClear] = useSound(audio_lineClear, {
    sprite: {
      clear: [4900, 6000],
      // click: [1500, 2000],
    },
    volume: 1,
    playbackRate: 1.3
  });
  const [sfx_tetris] = useSound(audio_tetris, {
    volume: 1.5,
    playbackRate: 1.5
  });
  const [sfx_gameOver] = useSound(audio_gameOver, {
    volume: 0.4,
    playbackRate: 1.0
  });

  const actionQue: Ref<GameAction[]> = useRef([]);
  const mouseEventArgs:[string, any] = [...fakeMouseEventArgs];

  const keyDownCallback = (key: string) => {
    console.log(key);
    switch(key){
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
        mouseEventArgs[1].buttons = ActionType.MOVE;
        btn.current?.dispatchEvent(new MouseEvent(...mouseEventArgs));
        break;
      case "ArrowUp":
        mouseEventArgs[1].buttons = ActionType.DROP;
        btn.current?.dispatchEvent(new MouseEvent(...mouseEventArgs));
        break;
      case "Alt":
      case "Shift":
        mouseEventArgs[1].buttons = ActionType.ROTATE;
        btn.current?.dispatchEvent(new MouseEvent(...mouseEventArgs));
    }
  }

  const actionCallback = (a: GameAction) => {
    
    if (a.type <= 4) {

      if(actionQue.current){
        actionQue.current.push({
          type: a.type,
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

    const mouseEventArgs:[string, any] = [...fakeMouseEventArgs];
    mouseEventArgs[1].buttons = a.type;
    btn.current?.dispatchEvent(new MouseEvent(...mouseEventArgs));
    
  }

  const handleSound = (e: MouseEvent) => {
    if(!soundEnabled) {
      return;
    }
    switch(e.buttons) {
      case ActionType.MOVE:
        sfx_movePiece();
        break;
      case ActionType.DROP:
        sfx_dropPiece({id:"drop"});
        break;
      case ActionType.ROTATE:
        // sfx_rotate();
        sfx_rotate({id:"click"});
        break;
      case ActionType.LEVEL_UP:
        // sfx_rotate();
        sfx_levelUp();
        break;
      case ActionType.SINGLE:
      case ActionType.DOUBLE:
      case ActionType.TRIPLE:
        // sfx_rotate();
        sfx_lineClear({id:'clear'});
        break;
      case ActionType.TETRIS:
        sfx_tetris();
        break;
      case ActionType.GAME_OVER:
        sfx_gameOver();
        break;
    }
  }

  return (
    <>
      <div className="tw-bg-slate-700 tw-scale-125 tw-bg-opacity-40">
        <div className={`tw-opacity-1`}>
          <h1 className="tw-m-0 tw-py-2 tw-font-thin game-header">TETRIS</h1>
        </div>
        <div style={{display:"none"}} ref={btn} onClick={handleSound}>play</div>

        {/* @ts-expect-error Server Component */}
        <Game init={true} keydownCallback={keyDownCallback} actionCallback={actionCallback}/>
        <ActionToast actions={actionQue.current || []}/>  
        <label for="EnableSounds">Sounds</label>
        <input id="EnableSounds" type="checkbox" onChange={()=>{
          setSoundEnabled(!soundEnabled);
        }} checked={soundEnabled} />
      </div>
      
    </>
  )
}
