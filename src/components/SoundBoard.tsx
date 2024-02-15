import { useEffect, useState } from 'preact/hooks'
import { ActionType } from '../TetrisConfig';
import { Ref } from 'preact';

// @ts-expect-error
import {useSound} from 'use-sound';

import audio_t99_music from '@sounds/t99-music.mp3'
import audio_t99 from '@sounds/t99-lvl-set-drop-mv-mvd-thud-rot-1-2-3-4-ts-hold-nm-ac-lcdrp.mp3';
import audio_gameOver from '@sounds/dramatic-synth-echo-43970.mp3';
import { BaseComponentProps } from '../BaseTypes';

interface SoundBoardProps extends BaseComponentProps {
  eventTargetRef: Ref<HTMLDivElement>;
  volume?: number;
}

export function SoundBoard(props:SoundBoardProps) {

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);

  const [sfx_t99Music, {pause}] = useSound(audio_t99_music, {
    volume: (props.volume || 50) / 100,
    playbackRate: 1
  });

  useEffect(()=>{
    if(musicEnabled){
      // if(!isPlaying()) {
        sfx_t99Music();
      // }
    } else {
      // if(isPlaying()) {
        pause();
      // }
    }

    return ()=>{
      pause();
    }
  },[musicEnabled]);

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
      moveNotAllowed: [10000,400],
      allClear: [11000,950],
      lineClearDrop: [12000,600],
    },
    volume: (props.volume || 50) / 150,
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
      case ActionType.MOVE_LEFT:
      case ActionType.MOVE_RIGHT:
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
      case ActionType.ROTATE_LEFT:
      case ActionType.ROTATE_RIGHT:
        sfx_tetris({id:"rotatePiece"});
        break;
      case ActionType.T_SPIN:
      case ActionType.T_SPIN_MINI:
        sfx_tetris({id:"tSpin"});
        break;
      case ActionType.T_SPIN_SINGLE:
      case ActionType.T_SPIN_MINI_SINGLE:
        sfx_tetris({id:"tSpin"});
        sfx_tetris({id:"single"});
        break;
      case ActionType.T_SPIN_DOUBLE:
      case ActionType.T_SPIN_MINI_DOUBLE:
        sfx_tetris({id:"tSpin"});
        sfx_tetris({id:"double"});
        break;
      case ActionType.T_SPIN_TRIPLE:
        sfx_tetris({id:"tSpin"});
        sfx_tetris({id:"single"});
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
      case ActionType.LINE_CLEAR_DROP:
        sfx_tetris({id:"lineClearDrop"});
        break;
      case ActionType.SET_PIECE:
        sfx_tetris({id:"setPiece"});
        break;
      case ActionType.MOVE_NOT_ALLOWED:
        sfx_tetris({id:"moveNotAllowed"});
        break;
      case ActionType.HOLD_PIECE:
        sfx_tetris({id:"holdPiece"});
        break;
      case ActionType.GAME_OVER:
        sfx_gameOver();
        break;
    }
  }

  return (
    <>
      <div data-layout={props.layout} className="game-sounds">
        <div style={{display:"none"}} ref={props.eventTargetRef} onClick={handleSound}>play</div>
          <div key="option1" className="sound-switch">
            <label for="EnableSoundFX">SoundFX</label>
            <div class="toggle-switch">
              <input class="toggle toggle-skewed" id="EnableSoundFX" type="checkbox" onChange={()=>{
                setSoundEnabled(!soundEnabled);
              }} checked={soundEnabled} />
              <label class="toggle-btn" data-label-off="OFF" data-label-on="ON" for="EnableSoundFX"></label>
            </div>
          </div>
          <div key="option2" className="sound-switch">
            <label for="EnableMusic">Music</label>
            <div class="toggle-switch">
              <input class="toggle toggle-skewed" id="EnableMusic" type="checkbox" 
              onChange={()=>{
                  setMusicEnabled(!musicEnabled);
                }} checked={musicEnabled} 
              />
              <label class="toggle-btn" data-label-off="OFF" data-label-on="ON" for="EnableMusic"></label>
            </div>
          </div>
        {/* </div> */}
      </div>
    </>
  );
}

export default SoundBoard