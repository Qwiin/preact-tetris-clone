import { Ref } from 'preact';
import { useEffect, useReducer, useRef, useState } from 'preact/hooks';
import { GameAction } from './TetrisConfig';
import './app.css';
import ActionToast from './components/ActionToast';
import Game from './components/Game';
import SoundBoard from './components/SoundBoard';
import {animate} from 'framer-motion';
import { Filters } from './effects/Filters';
import { AppLayout, LAYOUT_DESKTOP, LAYOUT_MOBILE } from './BaseTypes';
import { mobileCheck } from './utils/AppUtil';
// import { DevPanel } from './components/DevPanel';

const fakeMouseEventArgs:[string, any] = ["click",{
  view: window,
  bubbles: true,
  cancelable: true,
  buttons: 0,
}];

const PORTRAIT_MODE_WIDTH_THRESHOLD: number = 465;

const MIN_DESKTOP_WIDTH: number = 803;
const MIN_DESKTOP_HEIGHT: number = 520;

const RESIZE_DEBOUNCE_TIMEOUT: number = 500;

export function App() {

  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const soundBoardDomRef:Ref<HTMLDivElement> = useRef(null);
  const actionQue: Ref<GameAction[]> = useRef([]);
  const [theme, setTheme] = useState(1);
  const resizeTimeout: Ref<NodeJS.Timeout> = useRef(null);

  const appContainerRef: Ref<HTMLDivElement> = useRef(null);
  
  const [appScale, setAppScale] = useState(1);
  const [appLayout, setAppLayout] = useState<AppLayout>("desktop");

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize)

    // scale on mount
    handleWindowResize();

    return () => {
      window.removeEventListener("resize",handleWindowResize);
    }
  },[]);

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
        ? Math.min(Math.max(hScale, vScale), window.innerWidth/PORTRAIT_MODE_WIDTH_THRESHOLD * 1.56)  // PORTRAIT MODE
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
        "#AppContainer", 
        { 
          transform: `scale(${newAppScale})`,
        }, 
        { 
          duration: 0.3,
          ease: "easeInOut",
          delay: 0
        }
      );

      console.log({vScale, hScale, scaleRatio});
      console.log(`scale(${newAppScale})`);
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
  }

  return (
    <>
      {/* <DevPanel></DevPanel> */}
      <div id="AppContainer" ref={appContainerRef} className={`app-container theme-${theme}`} 
        data-theme={theme} 
        data-layout={appLayout}
        data-app-scale={appScale}
        // style={{
        //   transform: `scale(${appScale}) ${appScale < 1 ? `translateX(${100 * (appScale - 1)/2/appScale}%)` : ''}`
        // }}
        >
        <div id="NavHeader" className={`tw-opacity-1`}>
          <h1 className="tw-m-0 tw-py-2 tw-font-thin game-title">TETRIS</h1>
        </div>

        {/* @ts-expect-error Preact Component */}
        <Game init={true} actionCallback={actionCallback} layout={appLayout} startingLevel={1}/>
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
        <SoundBoard layout={appLayout} ref={soundBoardDomRef} volume={50}/>
      </div>
      <Filters />
    </>
  )
}
