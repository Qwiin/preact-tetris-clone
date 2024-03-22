import { animate } from "framer-motion";
import { Ref } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useSettingsStore } from "./store/SettingsStore";
import { useGameStore } from "./store/GameStore";


const OptionsModal = (props: { parentScale: number }) => {

  const [settingsState, setSettings] = useSettingsStore();
  const [gameState, setGameStore] = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const self: Ref<HTMLDivElement> = useRef(null);
  const button: Ref<HTMLDivElement> = useRef(null);
  // const appContext = useContext(AppContext) as GameStateAPI;

  const isMobile = screen.orientation.type.indexOf("portrait") >= 0;

  const slideOut = () => {
    animate(
      "#OptionsModal",
      {
        transform: [`translateY(${isMobile ? '-90%' : '-84%'}) scale(${100 * (props.parentScale ?? 1)}%)`, `translateY(0%) scale(${75 * (props.parentScale ?? 1)}%)`],
        boxShadow: ['inset #000D 0 0 0.0625rem 0.03125rem, 0rem -2rem 0.5rem 8rem #0009', 'inset #000D 0 0 0.0625rem 0.03125rem, 0rem -0.1rem 0.1rem 0.1rem #0006']
        // borderRadius: [`20rem`,`40rem`],
        // width: ["90%", "150%"],

      },
      {
        duration: 0.3,
        ease: "easeOut",
        delay: 0
      });
  }
  const slideIn = () => {
    animate(
      "#OptionsModal",
      {
        transform: [`translateY(0%) scale(${75 * (props.parentScale ?? 1)}%%)`, `translateY(${isMobile ? '-90%' : '-84%'}) scale(${100 * (props.parentScale ?? 1)}%)`],
        boxShadow: ['inset #000D 0 0 0.0625rem 0.03125rem, 0rem -0.1rem 0.1rem 0.1rem #0006', 'inset #000D 0 0 0.0625rem 0.03125rem, 0rem -2rem 0.5rem 8rem #0009']
        // borderRadius: [`40rem`,`20rem`],
        // width: ["150%", "90%"],
      },
      {
        duration: 0.3,
        ease: "easeOut",
        delay: 0
      });
  }

  useEffect(() => {
    if (isOpen) {
      self.current?.classList.remove('close');
      self.current?.classList.add('open');
      button.current?.classList.remove('close');
      button.current?.classList.add('open');
      // appContext.api.pauseGame();
      gameState.gamePaused = true
      setGameStore(gameState);
      slideIn();
    }
    else if (!isOpen) {
      self.current?.classList.remove('open');
      self.current?.classList.add('close');
      button.current?.classList.remove('open');
      button.current?.classList.add('close');
      // appContext.api.resumeGame();
      slideOut();
    }
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(settingsState.showOptions);
  }, [settingsState]);

  const toggleOpen = () => {

    // settingsState.showOptions = !settingsState.showOptions;
    setSettings({ ...settingsState, showOptions: !settingsState.showOptions });
    // self.current?.classList.remove(isOpen ? 'open' : 'close');
    // self.current?.classList.add(isOpen ? 'close' : 'open');
    // button.current?.classList.remove(isOpen ? 'open' : 'close');
    // button.current?.classList.add(isOpen ? 'close' : 'open');
    // setIsOpen( !isOpen );
  }

  return (

    <div ref={ self } id="OptionsModal">
      <div ref={ button } id="OptionsOpenButton" className="close" onClick={ toggleOpen }></div>

      <div className="options-group">
        <h3 className="tw-text-right">Audio</h3>
        <div className="tw-flex tw-flex-col">
          <ToggleSwitch id="Options_ToggleSound" label="Sound FX" isOn={ settingsState.soundEnabled }
            toggleCallback={ (value: boolean) => {
              // appContext.api.enableSound(value);
              // setSettings(value ? Commands.SOUND_ON : Commands.MUSIC_OFF);
              setSettings({ ...settingsState, soundEnabled: value });
            } } />
          <ToggleSwitch id="Options_ToggleMusic" label="Music" isOn={ settingsState.musicEnabled }
            toggleCallback={ (value: boolean) => {
              // appContext.api.enableMusic(value);
              // setSettings(value ? Commands.MUSIC_ON : Commands.MUSIC_OFF);
              setSettings({ ...settingsState, musicEnabled: value });
            } } />
        </div>
      </div>
      <div className="options-group">
        <h3 className="tw-text-right">Dev Panel</h3>
        <div className="tw-flex tw-flex-col">
          <ToggleSwitch id="Options_ToggleDevPanel" label="" isOn={ settingsState.isDevPanelOn }
            toggleCallback={ (value: boolean) => {
              // appContext.api.enableDevPanel(value);
              // setSettings(value ? Commands.DEV_PANEL_ON : Commands.DEV_PANEL_OFF);
              setSettings({ ...settingsState, isDevPanelOn: value });
              // console.log(JSON.stringify(settingsState));
            } } />
        </div>
      </div>
      <div className="options-group">
        <h3 className="tw-text-right">Touch Controls 2.0 (beta)</h3>
        <div className="tw-flex tw-flex-col">
          <ToggleSwitch id="Options_ToggleNewTouch" label="" isOn={ settingsState.isNewTouchEnabled }
            toggleCallback={ (value: boolean) => {
              // appContext.api.enableNewTouchControls(value);
              setSettings({ ...settingsState, isNewTouchEnabled: value });
              // console.log(JSON.stringify(settingsState));
            } } />
        </div>
      </div>

    </div>

  );
}
export default OptionsModal


/**
 * key - "path.to.value.key"
 */
interface ToggleSwitchProps {
  id: string;
  icon?: string;
  label: string;
  isOn: boolean;
  toggleCallback: (value: boolean) => void;
}

const ToggleSwitch = (props: ToggleSwitchProps) => {

  const [isOn, setIsOn] = useState(props.isOn);

  return (
    <>
      <div className="toggle-switch-wrapper tw-flex">
        { props.label && props.label.length > 0 &&
          <label for={ props.id }>{ props.label }</label>
        }
        <div class="toggle-switch">
          <input class="toggle toggle-skewed" id={ props.id } type="checkbox" onChange={ () => {
            console.log("toggle switch toggled");

            props.toggleCallback(!isOn);
            setIsOn(!isOn);
            // if (props.dispatchEventType) {
            //   document.dispatchEvent(
            //     new CustomEvent<string>(props.dispatchEventType, { bubbles: true, detail: props.keyPath })
            //   );
            // }
          } } checked={ isOn } />
          <label class="toggle-btn" data-label-off="OFF" data-label-on="ON" for={ props.id }></label>
        </div>
      </div>
    </>
  );
}

// TODO: move to utilities
export function getValueFromKeyPath<T>(context: any, dotPath: string) {
  const path = dotPath.split('.');
  let ptr = context;
  for (let i = 0; i < path.length; i++) {
    ptr = ptr[path[i]];
  }
  return ptr as T;
}
export function getValueParentFromKeyPath<T>(context: any, dotPath: string) {
  const path = dotPath.split('.');
  let ptr = context;
  for (let i = 0; i < path.length - 1; i++) {
    ptr = ptr[path[i]];
  }
  return ptr as T;
}
