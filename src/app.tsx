import { Ref } from 'preact';
import { useContext, useEffect, useReducer, useRef, useState } from 'preact/hooks';

import './app.css';
import ActionToast from './components/ActionToast';
import Game from './components/Game';
// import SoundBoard from './components/SoundBoard';
import {animate} from 'framer-motion';
import { Filters } from './effects/Filters';
import { AppLayout, LAYOUT_DESKTOP, LAYOUT_MOBILE } from './BaseTypes';
import { mobileCheck } from './utils/AppUtil';
// import { DevPanel } from './components/DevPanel';
// import { TetrisLogo } from './components/TetrisLogo';
// import { TetrisLogoSvg } from './components/TetrisLogoSvg';
// import { StatsPanel } from './components/StatsPanel';
// import { MenuPanel } from './components/MenuPanel';
import AppProvider, { AppContext, GameStateAPI } from './AppProvider';
import { MenuPanel } from './components/MenuPanel';
import { StatsPanel, updateStatsByRef } from './components/StatsPanel';
import OptionsModal from './OptionsModal';
import { GameAction } from './TetrisConfig';

// const DEV_PANEL_ENABLED: boolean = true;

const fakeMouseEventArgs:[string, any] = ["click",{
  view: window,
  bubbles: true,
  cancelable: true,
  buttons: 0,
}];

const PORTRAIT_MODE_WIDTH_THRESHOLD: number = 624;

const MIN_DESKTOP_WIDTH: number = 803;
const MIN_DESKTOP_HEIGHT: number = 404;

const RESIZE_DEBOUNCE_TIMEOUT: number = 100;

export function App() {

  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const soundBoardDomRef:Ref<HTMLDivElement> = useRef(null);
  const statsRef: Ref<HTMLDivElement> = useRef(null);
  const actionQue: Ref<GameAction[]> = useRef([]);
  const [theme, setTheme] = useState(1);
  const resizeTimeout: Ref<NodeJS.Timeout> = useRef(null);
  const appContext = useContext(AppContext) as GameStateAPI;

  const gamePanelRef: Ref<HTMLDivElement> = useRef(null);
  
  const appContainerRef: Ref<HTMLDivElement> = useRef(null);
  
  const [appScale, setAppScale] = useState(1);
  const [mainPanelScale, setMainPanelScale] = useState(1);
  const [sidePanelScale, setSidePanelScale] = useState(1);
  const [appLayout, setAppLayout] = useState<AppLayout>("desktop");

  useEffect(() => {
    // window.addEventListener("resize", handleWindowResize);
    window.onresize = handleWindowResize;
    window.ondeviceorientation = handleWindowResize;
    window.onblur = ()=>{ appContext.api.pauseGame(); }
    

    // scale on mount
    setTimeout(()=>{
      handleWindowResize();
    }, 500);

    return () => {
      window.removeEventListener("resize",handleWindowResize);
    }
  },[window.screen.orientation, window.innerWidth, window.innerHeight]);

  useEffect(()=>{
      if(theme !== 1) {
        setTheme(1);
      }
  },[theme]);

  const handleWindowResize = (event?: Event) => { 

    if(!event) {
      console.log("Window Resize triggered manually");
    }
    
    if(resizeTimeout.current) { 
      // debounce window resize
      clearTimeout(resizeTimeout.current);
    }

    resizeTimeout.current = setTimeout(()=>{
      console.log("...resize timeout completed");
      console.log(appContainerRef.current);
      resizeApp();
    }, RESIZE_DEBOUNCE_TIMEOUT);
    
  }

  const resizeApp = () => {

    
    // let windowAspectRatio = window.innerWidth / window.innerHeight;
    let hScale: number = window.innerWidth / MIN_DESKTOP_WIDTH;
    let vScale: number = window.innerHeight / MIN_DESKTOP_HEIGHT;
    console.log({hScale, vScale});

    console.log({portraitRatio: window.innerHeight / window.innerWidth});

      let scaleRatio: number = hScale/vScale;
      let newAppScale = (window.innerWidth <= PORTRAIT_MODE_WIDTH_THRESHOLD && vScale > hScale) 
        ? Math.min(Math.max(hScale, vScale), window.innerWidth/PORTRAIT_MODE_WIDTH_THRESHOLD * 2.0)  // PORTRAIT MODE
        : Math.min(hScale, vScale);

      let newAppLayout: AppLayout = (window.innerWidth <= PORTRAIT_MODE_WIDTH_THRESHOLD && vScale > hScale) ? LAYOUT_MOBILE : LAYOUT_DESKTOP;
      setAppLayout( newAppLayout );
      setAppScale(newAppScale);

      if(newAppLayout === LAYOUT_MOBILE || mobileCheck()) {
        if((screen.orientation as any).hasOwnProperty("lock")) {
          (screen.orientation as any).lock("portrait");
        }
      }
      else {
        if((screen.orientation as any).hasOwnProperty("unlock")) {
          (screen.orientation as any).unlock();
        }
      }

      document.body.setAttribute('data-layout', newAppLayout);

      animate(
        ".app-wrapper", 
        { 
          // transform: `scale(${newAppScale})`
          height: window.innerHeight,
          width: window.innerWidth,
        }, 
        { 
          duration: 0.3,
          ease: "easeInOut",
          delay: 0
        }
      );

      console.log({vScale, hScale, scaleRatio});
      console.log(`scale(${newAppScale})`);


      

      if(newAppLayout === LAYOUT_DESKTOP || newAppLayout === LAYOUT_MOBILE) {
        
        const gamePanelBounds = gamePanelRef.current?.getBoundingClientRect();
        const statPanelRef = document.querySelector("#StatsPanel");
        const statPanelBounds = statPanelRef?.getBoundingClientRect();

        if(gamePanelBounds && statPanelBounds) {
          const BASE_WIDTH_GAME: number = 282; 
          const BASE_HEIGHT_GAME: number = newAppLayout === LAYOUT_DESKTOP ? 350 : 525; 
          const gameWidthScale = gamePanelBounds.width / BASE_WIDTH_GAME;
          const gameHeightScale = gamePanelBounds.height * 0.96 / BASE_HEIGHT_GAME;
          const _mainPanelScale = Math.min(gameWidthScale, gameHeightScale);
          setMainPanelScale(_mainPanelScale);
          console.log(_mainPanelScale);
          // gamePanelRef.current.style.transform("")
        

          if(newAppLayout === LAYOUT_DESKTOP) {
            const BASE_WIDTH_SIDE_PANEL: number = 140; 
            const BASE_HEIGHT_SIDE_PANEL: number = 350; 
            const panelWidthScale = statPanelBounds.width * 1 / BASE_WIDTH_SIDE_PANEL;
            const panelHeightScale = statPanelBounds.height * 0.9 / BASE_HEIGHT_SIDE_PANEL;
            const _sidePanelScale = Math.min(panelWidthScale, panelHeightScale, Math.max(_mainPanelScale * 0.75, 0.75));
            setSidePanelScale(_sidePanelScale);
            console.log(_sidePanelScale);
          }
          else{
            setSidePanelScale(1);
          }
        }
        
      }
  }

  const actionCallback = (a: GameAction) => {
    
    if (a.text || a.subtext || a.toast) {

      if(actionQue.current){
        actionQue.current.unshift(a);
        // console.log(JSON.stringify(actionQue.current));
      }
      // setTimeout(()=>{
      //   a.transitioning = false;
      // },ToastTimeout);
      requestAnimationFrame(() => {
        forceUpdate(1);
      });
    }

    const mouseEventArgs:[string, any] = [...fakeMouseEventArgs];
    mouseEventArgs[1].buttons = a.type;
    soundBoardDomRef.current?.dispatchEvent(new MouseEvent(...mouseEventArgs));  
  };

  // const menuButtonCallback = (action: MenuButtonAction) => {
  //   if(action === "restart") {    
  //     appContext.resetGame();
  //     return;
  //   }
  //   if(action === "pause") {
  //     appContext.pauseGame();
  //   }
  //   else {
  //     if(appContext.gamePaused) {
  //       appContext.resumeGame();
  //     }
  //     // resumeGame(RESUME_DELAY);
  //   }
  // }

  return (
    <>

    <AppProvider>    
      

      {/* <div id="NavHeader" className={`tw-opacity-1`} style={{zIndex: 4000}}> */}
          {/* <h1 className="tw-m-0 tw-py-2 tw-font-thin game-title">TETRIS</h1> */}
          {/* <TetrisLogo scale={appLayout === LAYOUT_DESKTOP ? 0.4 : 0.25}></TetrisLogo> */}
          {/* <TetrisLogoSvg id="HeaderSVG"
            // strokeColor='#89A6D3' 
            strokeColor='#999' 
            strokeLinecap='round' 
            strokeLinejoin='round' 
            fillColor="#00000000" 
            fillOpacity={1} 
            strokeWidth={appLayout===LAYOUT_DESKTOP ? "0.25rem" : "0.2rem"} 
            height={appLayout===LAYOUT_DESKTOP ? "5.2rem" : "5.5rem"}
            letterFilter={ 
              // undefined
              'url(#shadow2)'
            }
            ></TetrisLogoSvg> */}
        {/* </div> */}

      <div id="AppContainer" ref={appContainerRef} className={`app-container theme-${theme}`} 
        data-theme={theme} 
        data-layout={appLayout}
        data-app-scale={appScale}
        // style={{
        //   transform: `scale(${appScale}) ${appScale < 1 ? `translateX(${100 * (appScale - 1)/2/appScale}%)` : ''}`
        // }}
        >

          <MenuPanel
            scale={appLayout === LAYOUT_DESKTOP ? sidePanelScale : mainPanelScale}
            layout={appLayout}
            ref={soundBoardDomRef}>
            </MenuPanel>

          <div id="GamePanel" ref={gamePanelRef}>
            <div id="GameScaleWrapper" style={{
              transform: `scale(${mainPanelScale})`
            }}>
            {/* @ts-expect-error Preact Component */}
              <Game init={true} actionCallback={actionCallback} layout={appLayout} startingLevel={1} 
              statsCallback={ () => {
                  if (statsRef.current) {
                    updateStatsByRef(appContext.props.stats, statsRef.current);
                  }
                  else {
                    console.error("statsRef is not mounted");
                  }
                }
              }/>
              <ActionToast layout={appLayout}
              actions={actionQue.current || []} 
              toastComplete={(id?: string)=>{
                if(!actionQue.current || !id) {
                  return;
                }
                for(let i=0; i<actionQue.current.length; i++) {
                  if(id === actionQue.current[i].id) {
                    actionQue.current.splice(i,1);
                    break;
                  }
                }
                // console.log("toastComplete");
              }}
              />
            </div>
          </div>
          <StatsPanel ref={statsRef} layout={appLayout} 
          // scale={sidePanelScale}
          scale={appLayout === LAYOUT_DESKTOP ? sidePanelScale : Math.max(Math.sqrt(mainPanelScale) * 0.95, 1)}
          ></StatsPanel>
      </div>
      {/* <DevPanel layout={appLayout} enabled={DEV_PANEL_ENABLED}></DevPanel> */}
      <OptionsModal></OptionsModal>
      <Filters />
      </AppProvider>
    </>
  )
}
