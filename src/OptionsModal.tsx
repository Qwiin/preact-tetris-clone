import { animate } from "framer-motion";
import { Context, PreactContext, Ref } from "preact";
import { useContext, useEffect, useReducer, useRef, useState } from "preact/hooks";
import { AppContext, GameState, GameStateAPI, UserContext, UserState } from "./AppProvider";
import { BaseComponentProps } from "./BaseTypes";

const OptionsModal = (props: { parentScale: number }) => {

  const [isOpen, setIsOpen] = useState(false);
  const self: Ref<HTMLDivElement> = useRef(null);
  const button: Ref<HTMLDivElement> = useRef(null);
  const appContext = useContext(AppContext) as GameStateAPI;

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
      appContext.api.pauseGame();
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
    if (appContext.props.showOptions) {
      setIsOpen(true);
    }
    else {
      setIsOpen(false);
    }
  }, [appContext.props.showOptions]);

  const toggleOpen = () => {

    if (!isOpen) {
      appContext.api.showOptions();
    }
    else {
      appContext.api.hideOptions();
    }
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
          <ToggleSwitch id="Options_ToggleSound" label="Sound FX" contextType="game" keyPath="props.isSoundOn" toggleCallback={ appContext.api.enableSound } />
          <ToggleSwitch id="Options_ToggleMusic" label="Music" contextType="game" keyPath="props.isMusicOn" toggleCallback={ appContext.api.enableMusic } />
        </div>
      </div>
      <div className="options-group">
        <h3 className="tw-text-right">Dev Panel</h3>
        <div className="tw-flex tw-flex-col">
          <ToggleSwitch id="Options_ToggleDevPanel" label="Dev Panel" contextType="game" keyPath="props.isDevPanelOn"
            dispatchEventType="update_app"
            toggleCallback={ (value: boolean) => {
              appContext.api.enableDevPanel(value);
            } } />
        </div>
      </div>

    </div>

  );
}
export default OptionsModal

export type ContextType = "app" | "game" | "theme" | "user";

/**
 * key - "path.to.value.key"
 */
interface ToggleSwitchProps extends BaseComponentProps {
  icon?: string;
  label: string;
  contextType: ContextType;
  keyPath: string;
  dispatchEventType?: string;
  toggleCallback: (value: boolean) => void;
}

const ToggleSwitch = (props: ToggleSwitchProps) => {

  const context: GameState | UserState | undefined = getContextFromType(props.contextType);
  const [isOn, setIsOn] = useState(getValueFromKeyPath<boolean>(context, props.keyPath));
  // const ctxValueKey: string = props.keyPath.split('.').pop() as string;

  // const ctxValueParent = getValueParentFromKeyPath<any>(context, props.keyPath);

  function getContextFromType(contextType: string) {
    switch (contextType) {
      case "app":
      case "game":
        return useContext(AppContext);
      case "user":
        return useContext(UserContext);
    }
  }

  // useEffect(() => {
  //   setIsOn(ctxValueParent[ctxValueKey]);
  // }, [ctxValueParent[ctxValueKey]]);

  return (
    <>
      <div className="toggle-switch-wrapper tw-flex">
        <label for={ props.id }>{ props.label }</label>
        <div class="toggle-switch">
          <input class="toggle toggle-skewed" id={ props.id } type="checkbox" onChange={ () => {
            console.log("toggle switch toggled");
            if (props.dispatchEventType) {
              document.dispatchEvent(
                new CustomEvent<string>(props.dispatchEventType, { bubbles: true, detail: props.keyPath })
              );
            }
            props.toggleCallback(!isOn);
            setIsOn(!isOn);
          } } checked={ isOn } />
          <label class="toggle-btn" data-label-off="OFF" data-label-on="ON" for={ props.id }></label>
        </div>
      </div>
    </>
  );
}

// TODO: move to utilities
function getValueFromKeyPath<T>(context: any, dotPath: string) {
  const path = dotPath.split('.');
  let ptr = context;
  for (let i = 0; i < path.length; i++) {
    ptr = ptr[path[i]];
  }
  return ptr as T;
}
function getValueParentFromKeyPath<T>(context: any, dotPath: string) {
  const path = dotPath.split('.');
  let ptr = context;
  for (let i = 0; i < path.length - 1; i++) {
    ptr = ptr[path[i]];
  }
  return ptr as T;
}
