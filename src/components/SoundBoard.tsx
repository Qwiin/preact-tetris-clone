import { forwardRef } from 'preact/compat';
import { useEffect, useRef, useState, useReducer } from 'preact/hooks';
import { Ref } from 'preact';
import { ActionType } from '../TetrisConfig';

// @ts-expect-error
import { useSound } from 'use-sound';

import audio_t99_music from '@sounds/t99-music.mp3';
import audio_t99 from '@sounds/t99-lvl-set-drop-mv-mvd-thud-rot-1-2-3-4-ts-hold-nm-ac-lcdrp.mp3';
// import audio_gameOver from '@sounds/dramatic-synth-echo-43970.mp3';
import audio_gameOver from '@sounds/gameover.mp3';
import audio_resume from '@sounds/success_bell-6776.mp3';
// import audio_pause from '@sounds/interface-124464.mp3';
import audio_pause from '@sounds/notification-for-game-scenes-132473.mp3';


import { BaseComponentProps, LAYOUT_DESKTOP, LAYOUT_MOBILE } from '../BaseTypes';
import Slider from './Slider';
import { useSettingsStore } from '../store/SettingsStore';

interface SoundBoardProps extends BaseComponentProps {
  // eventTargetRef: Ref<HTMLDivElement>;
  volume?: number;
}

const SoundBoard = forwardRef(
  function SoundBoard(props: SoundBoardProps, eventTargetRef: Ref<HTMLDivElement>) {

    const [soundEnabled, setSoundEnabled] = useState(false);
    const [musicEnabled, setMusicEnabled] = useState(false);

    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const sfxVolume = useRef(props.volume !== undefined ? props.volume : 50);
    const musicVolume = useRef(props.volume !== undefined ? props.volume : 50);

    const [sfx_t99Music, { pause, sound }] = useSound(audio_t99_music, {
      volume: (Math.sqrt(musicVolume.current) ?? props.volume ?? 0) / 100,
      playbackRate: 1
    });

    // const gameState = useContext(AppContext);
    const [settingsState] = useSettingsStore();

    useEffect(() => {

      if (musicEnabled !== settingsState.musicEnabled) {
        setMusicEnabled(settingsState.musicEnabled);
      }
      if (soundEnabled !== settingsState.soundEnabled) {
        if (settingsState.soundEnabled === true) {
          sfx_tetris({ id: "holdPiece" });
        }
        setSoundEnabled(settingsState.soundEnabled);
      }

      if (musicEnabled) {
        // if(!isPlaying()) {
        sfx_t99Music();
        // }
      } else {
        // if(isPlaying()) {
        pause();
        // }
      }

      return () => {
        pause();
      }
    }, [musicEnabled, settingsState.soundEnabled, settingsState.musicEnabled]);


    const [sfx_pause] = useSound(audio_pause, {
      volume: (Math.sqrt(sfxVolume.current) ?? props.volume ?? 0) / 100,
      playbackRate: 1
    });
    const [sfx_resume] = useSound(audio_resume, {
      volume: (Math.sqrt(sfxVolume.current) ?? props.volume ?? 0) / 100,
      playbackRate: 1
    });

    const [sfx_tetris] = useSound(audio_t99, {
      sprite: {
        levelUp: [0, 950],
        setPiece: [1000, 650],
        dropPiece: [2000, 650],
        movePiece: [2750, 120],
        movePieceDown: [2875, 120],
        thudPiece: [3000, 300],
        rotatePiece: [3500, 200],
        single: [4000, 500],
        double: [5000, 700],
        triple: [6000, 700],
        tetris: [7000, 950],
        tSpin: [8000, 950],
        holdPiece: [9000, 400],
        moveNotAllowed: [10000, 400],
        lineClearDrop: [11000, 600],
        allClear: [12000, 3000],
      },
      volume: (Math.sqrt(sfxVolume.current) ?? props.volume ?? 0) / 100,
      playbackRate: 1.0
    });

    const [sfx_gameOver] = useSound(audio_gameOver, {
      volume: (Math.sqrt(sfxVolume.current) ?? props.volume ?? 0) / 120,
      playbackRate: 1.0
    });

    const handleSound = (e: MouseEvent) => {

      if (!soundEnabled) {
        return;
      }
      switch (e.buttons) {
        case ActionType.MOVE_LEFT:
        case ActionType.MOVE_RIGHT:
          sfx_tetris({ id: "movePiece" });
          break;
        case ActionType.MOVE_DOWN:
          sfx_tetris({ id: "movePieceDown" });
          break;
        case ActionType.THUD:
          sfx_tetris({ id: "thudPiece" });
          break;
        case ActionType.DROP:
          sfx_tetris({ id: "dropPiece" });
          break;
        case ActionType.ROTATE_LEFT:
        case ActionType.ROTATE_RIGHT:
          sfx_tetris({ id: "rotatePiece" });
          break;
        case ActionType.T_SPIN:
        case ActionType.T_SPIN_MINI:
          sfx_tetris({ id: "tSpin" });
          break;
        case ActionType.T_SPIN_SINGLE:
        case ActionType.T_SPIN_MINI_SINGLE:
          sfx_tetris({ id: "tSpin" });
          sfx_tetris({ id: "single" });
          break;
        case ActionType.T_SPIN_DOUBLE:
        case ActionType.T_SPIN_MINI_DOUBLE:
          sfx_tetris({ id: "tSpin" });
          sfx_tetris({ id: "double" });
          break;
        case ActionType.T_SPIN_TRIPLE:
          sfx_tetris({ id: "tSpin" });
          sfx_tetris({ id: "single" });
          break;
        case ActionType.LEVEL_UP:
          sfx_tetris({ id: "levelUp" });
          break;
        case ActionType.SINGLE:
          sfx_tetris({ id: "single" });
          break;
        case ActionType.DOUBLE:
          sfx_tetris({ id: "double" });
          break;
        case ActionType.TRIPLE:
          sfx_tetris({ id: "triple" });
          break;
        case ActionType.TETRIS:
          sfx_tetris({ id: "tetris" });
          break;
        case ActionType.LINE_CLEAR_DROP:
          sfx_tetris({ id: "lineClearDrop" });
          break;
        case ActionType.SET_PIECE:
          sfx_tetris({ id: "setPiece" });
          break;
        case ActionType.MOVE_NOT_ALLOWED:
          sfx_tetris({ id: "moveNotAllowed" });
          break;
        case ActionType.HOLD_PIECE:
          sfx_tetris({ id: "holdPiece" });
          break;
        case ActionType.PAUSE:
          pause();
          sfx_pause();
          break;
        case ActionType.NEW_GAME:
        case ActionType.RESUME:
          sfx_resume();
          if (musicEnabled) {
            pause();
            sfx_t99Music();
          }
          break;
        case ActionType.GAME_OVER:

          if (musicEnabled) {
            fadeOut(sound, (Math.sqrt(musicVolume.current) / 100), () => {
              console.log("fadeOut complete");
            });
          }
          sfx_gameOver();
          break;
      }
    }

    const fadeOut = (sound: any, currentVolume: number, callback: () => void) => {
      console.log(currentVolume);
      if (currentVolume <= 0.02) {
        sound.stop();
        callback();
        return;
      }
      setTimeout(() => {
        sound.pause();
        const lowerVolume = currentVolume / Math.SQRT2;
        sound.volume(lowerVolume);
        sfx_t99Music();
        fadeOut(sound, lowerVolume, callback);
      }, 100);
    }


    const toggleSound = () => {
      if (!soundEnabled) {
        sfx_tetris({ id: "holdPiece" });
        setSoundEnabled(true);
      }
      else {
        setSoundEnabled(false);
        setMusicEnabled(false);
      }
    };

    const toggleMusic = () => {
      setMusicEnabled(!musicEnabled);
    };

    return (
      <>
        <div data-layout={ props.layout } className="game-sounds">
          <div style={ { display: "none" } } ref={ eventTargetRef } onClick={ handleSound }>play</div>
          <div key="option1" className="sound-switch">
            { props.layout === LAYOUT_MOBILE &&
              <div className={ `switch-icon sound ${soundEnabled ? 'enabled' : ''}` }
                onClick={ toggleSound }
              ></div>
            }
            { props.layout === LAYOUT_DESKTOP && <>
              <label for="EnableSoundFX">SoundFX</label>
              <div class="toggle-switch">
                <input class="toggle toggle-skewed" id="EnableSoundFX" type="checkbox" onChange={ toggleSound } checked={ soundEnabled } />
                <label class="toggle-btn" data-label-off="OFF" data-label-on="ON" for="EnableSoundFX"></label>
              </div>
            </>
            }
          </div>
          <Slider
            // ref={sfxVolumeRef}
            id="VolumeSFX"
            className="soundfx-volume"
            layout={ props.layout }
            min={ 0 }
            max={ 100 }
            value={ sfxVolume.current ?? 50 }
            onChange={ (value: number) => {
              sfxVolume.current = value;
              forceUpdate(1);
            } }

          ></Slider>
          <div key="option2" className="sound-switch">
            { props.layout === LAYOUT_MOBILE &&
              <div
                style={ {
                  transform: "translateX(-0.1rem)"
                } } className={ `switch-icon music ${musicEnabled ? 'enabled' : ''}` }
                onClick={ toggleMusic }
              ></div>
            }
            { props.layout === LAYOUT_DESKTOP &&
              <>
                <label for="EnableMusic">Music</label>
                <div class="toggle-switch">
                  <input class="toggle toggle-skewed" id="EnableMusic" type="checkbox"
                    onChange={ toggleMusic } checked={ musicEnabled }
                  />
                  <label class="toggle-btn" data-label-off="OFF" data-label-on="ON" for="EnableMusic"></label>
                </div>
              </>
            }
          </div>

          <Slider
            // ref={musicVolumeRef}
            id="VolumeMusic"
            className="music-volume"
            layout={ props.layout }
            min={ 0 }
            max={ 100 }
            value={ musicVolume.current || 50 }

            onChange={ (value: number) => {
              musicVolume.current = value;
              forceUpdate(1);
            } }

          ></Slider>
          {/* </div> */ }
        </div>
      </>
    );
  });

export default SoundBoard;
