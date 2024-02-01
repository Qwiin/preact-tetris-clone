import { useState } from 'preact/hooks'
import { ActionType } from '../TetrisConfig';
import { Ref } from 'preact';

// @ts-expect-error
import {useSound} from 'use-sound';

import audio_t99 from '@sounds/t99-lvl-set-drop-mv-mvd-thud-rot-1-2-3-4-ts-hold-nm-ac.mp3';
import audio_gameOver from '@sounds/dramatic-synth-echo-43970.mp3';

interface SoundBoardProps {
  eventTargetRef: Ref<HTMLDivElement>;
  volume?: number;
}

export function SoundBoard(props:SoundBoardProps) {

  const [soundEnabled, setSoundEnabled] = useState(false);

  const [sfx_tetris] = useSound(audio_t99, {
    sprite: {
      levelUp: [0,950],
      setPiece: [1000,650],
      dropPiece: [2000,650],
      movePiece: [2750,120],
      movePieceDown: [2875,120],
      thudPiece: [3000,300],
      rotatePiece: [3500,200],
      single: [4000,500],
      double: [5000,700],
      triple: [6000,700],
      tetris: [7000,950],
      tSpin: [8000,950],
      holdPiece: [9000,400],
      moveNotAllowed: [9000,400],
      allClear: [10000,950],
    },
    volume: (props.volume || 50) / 100,
    playbackRate: 1.0
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
        sfx_tetris({id:"movePiece"});
        break;
      case ActionType.MOVE_DOWN:
        sfx_tetris({id:"movePieceDown"});
        break;
      case ActionType.THUD:
        sfx_tetris({id:"thudPiece"});
        break;
      case ActionType.DROP:
        sfx_tetris({id:"dropPiece"});
        break;
      case ActionType.ROTATE:
        sfx_tetris({id:"rotatePiece"});
        break;
      case ActionType.LEVEL_UP:
        sfx_tetris({id:"levelUp"});
        break;
      case ActionType.SINGLE:
        sfx_tetris({id:"single"});
        break;
      case ActionType.DOUBLE:
        sfx_tetris({id:"double"});
        break;
      case ActionType.TRIPLE:
        sfx_tetris({id:"triple"});
        break;
      case ActionType.TETRIS:
        sfx_tetris({id:"tetris"});
        break;
      case ActionType.SET_PIECE:
        sfx_tetris({id:"setPiece"});
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