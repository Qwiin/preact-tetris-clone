import { useRef, useState } from 'preact/hooks'

// @ts-expect-error
import {useSound} from 'use-sound';

import audio_movePiece from '@sounds/mixkit-game-ball-tap-2073.wav';
import audio_dropPiece from '@sounds/sci-fi-gun-shot-x6-14447.mp3'
import audio_levelUp from '@sounds/mixkit-bonus-earned-in-video-game-2058.wav';
import audio_rotate from '@sounds/click-button-140881.mp3'
import audio_lineClear from '@sounds/game-ui-sounds-14857.mp3'
import audio_tetris from '@sounds/dark-boom-139891.mp3'
import audio_gameOver from '@sounds/dramatic-synth-echo-43970.mp3'
import { ActionType } from '../TetrisConfig';
import { FunctionalComponent, Ref } from 'preact';

interface SoundBoardProps {
  eventTargetRef: Ref<HTMLDivElement> 
}

export function SoundBoard(props:SoundBoardProps): FunctionalComponent {

  // const btn: Ref<HTMLDivElement> = useRef(null);

  const [soundEnabled, setSoundEnabled] = useState(false);

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
      <div className="tw-absolute tw-font-mono">
        <div style={{display:"none"}} ref={props.eventTargetRef} onClick={handleSound}>play</div>
        <input id="EnableSounds" type="checkbox" onChange={()=>{
          setSoundEnabled(!soundEnabled);
        }} checked={soundEnabled} />
        <label for="EnableSounds" className="tw-ml-2 tw-text-sm">Game Sound</label>
      </div>
    </>
  );
}

export default SoundBoard