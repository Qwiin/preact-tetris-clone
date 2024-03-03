import { Link } from "preact-router";
// import { CSSColors } from "./BaseTypes";
import { TetrisLogoSvg } from "./components/TetrisLogoSvg";
import { useContext, useEffect, useLayoutEffect, useReducer, useRef } from "preact/hooks";
import { getAuth } from "firebase/auth";
import { PATH_HOME, PATH_PROFILE, PATH_SIGNUP } from "./App2";
import { AppContext, GameStateAPI, UserContext, UserStateAPI } from "./AppProvider";
import { BaseComponentProps, LAYOUT_DESKTOP } from "./BaseTypes";
import { mobileCheck, swapCssClass } from "./utils/AppUtil";
import { Ref } from "preact";

export default function AppHeader(props: BaseComponentProps) {

  const userState = useContext(UserContext) as UserStateAPI;
  const gameState = useContext(AppContext) as GameStateAPI;
  const pauseResumeButton: Ref<HTMLDivElement> = useRef(null);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  // const [signedIn, setSignedIn] = useState(false);

  const currentUser = getAuth().currentUser;

  useEffect(() => {
    const pauseHandler = () => {
      if (pauseResumeButton.current) {
        swapCssClass(pauseResumeButton.current, "unpaused", "paused");
      }
    };
    const resumeHandler = () => {
      if (pauseResumeButton.current) {
        swapCssClass(pauseResumeButton.current, "paused", "unpaused");
      }
    };
    document.addEventListener("game_pause", pauseHandler);
    document.addEventListener("game_resume", resumeHandler);

    return () => {
      document.removeEventListener("game_pause", pauseHandler);
      document.removeEventListener("game_resume", resumeHandler);
    }
  }, [])

  useLayoutEffect(() => {
    if (!currentUser && !userState.user) {
      setTimeout(() => {
        forceUpdate(1);
      }, 1000);
    }
    if (currentUser && !userState.user) {
      userState.setUser(currentUser);
      // setTimeout(()=>{
      //   forceUpdate(1);
      // },1000);
    }
  }, [currentUser, userState.user, gameState.props.gamePaused]);

  return (

    <header id={ props.id } data-layout={ props.layout } className={ `app-header tw-h-16` } style={ { zIndex: 5000 } }>
      {/* <nav className={ `nav-item left tw-h-auto tw-z-50 tw-bg-slate-600` }>
        <div className={ `nav-icon settings ${gameState.props.showOptions ? 'open' : ''}` } onClick={ () => {
          if (gameState.props.showOptions === true) {
            gameState.api.hideOptions();
          }
          else {
            gameState.api.showOptions();
          }
        } }>

        </div>
      </nav> */}
      <nav className={ `nav-item left tw-h-auto tw-z-50 tw-bg-slate-600` }>
        <div ref={ pauseResumeButton } className={ `nav-icon pause-resume ${gameState.props.gamePaused ? 'paused' : 'unpaused'}` } onClick={ () => {
          if (gameState.props.gamePaused === true) {
            gameState.api.resumeGame();
          }
          else {
            gameState.api.pauseGame();
          }
        } }>

        </div>
      </nav>

      <Link href={ PATH_HOME } style={ { display: "block" } }>
        <TetrisLogoSvg id="HeaderSVG"
          // strokeColor='#89A6D3' 
          strokeColor='#999'
          strokeLinecap='round'
          strokeLinejoin='round'
          fillColor="#00000000"
          fillOpacity={ 1 }
          strokeWidth={ true ? "0.25rem" : "0.2rem" }
          height={ screen.orientation.type.indexOf('landscape') >= 0 && mobileCheck()
            ? "3.5rem"
            : props.layout === LAYOUT_DESKTOP
              ? "5.5rem"
              : "4rem"
          }

          letterFilter={
            // undefined
            'url(#shadow2)'
          }
        ></TetrisLogoSvg>
      </Link>
      <ProfileNav id="ProfileNav" layout={ props.layout } />
    </header>
  );

}

export function ProfileNav(props: BaseComponentProps) {
  const userState = useContext(UserContext);

  return (
    <nav id={ props.id } data-layout={ props.layout } data-orientation={ screen.orientation } className={ `nav-item right tw-h-auto tw-z-50 tw-bg-slate-600` }>
      {/* <Link className="active tw-text-blue-500 tw-text-2xl tw-bg-slate-500 tw-w-24" href="/" style={{display: "block"}}>
          Home
        </Link> */}

      { userState.user &&

        <Link className="active tw-text-blue-500 tw-text-2xl tw-w-24 tw-bg-slate-500" href={ PATH_PROFILE } style={ { display: "block" } }>
          <div className="nav-icon user-icon" style={ {
            backgroundImage: `url("${userState.user?.photoURL}")`
          } }>
            { !userState.user?.photoURL &&
              userState.user?.displayName?.substring(0, 1).toUpperCase()
            }
          </div>
        </Link>
      }
      { !userState.user &&
        <Link className="active tw-text-blue-500 tw-text-2xl tw-w-24 tw-bg-slate-500" href={ PATH_SIGNUP } style={ { display: "block" } }>
          Sign In
        </Link>
      }
      {/* <Link className="active tw-text-blue-500 tw-text-2xl tw-w-24 tw-bg-slate-500" href="/signup" style={{display: "block"}}>
          Sign Up
        </Link> */}
      {/* <Link href="/notfound">NotFound</Link> */ }
    </nav>
  );
}