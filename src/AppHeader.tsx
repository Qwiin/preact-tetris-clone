import { Link } from "preact-router";
// import { CSSColors } from "./BaseTypes";
import { TetrisLogoSvg } from "./components/TetrisLogoSvg";
import { useContext, useEffect, useLayoutEffect, useReducer, useRef, useState } from "preact/hooks";
import { getAuth } from "firebase/auth";
import { PATH_HOME } from "./App2";
import { UserContext, UserStateAPI } from "./AppProvider";
import { BaseComponentProps } from "./BaseTypes";
import { getRootStyle } from "./utils/AppUtil";
import { Ref } from "preact";
import ModalNav from "./components/ModalNav";
// import { useGameStore } from "./store/GameStore";
import { Commands, useSettingsStore } from "./store/SettingsStore";

export default function AppHeader(props: any) {

  const userState = useContext(UserContext) as UserStateAPI;
  // const gameState = useContext(AppContext) as GameStateAPI;
  // const [gameState, setGameStore] = useGameStore();
  const [settingsState, setSettingsStore] = useSettingsStore();
  const pauseResumeButton: Ref<HTMLDivElement> = useRef(null);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const [headerHeight, setHeaderHeight] = useState(getRootStyle('--header-logo-height'));

  // const [signedIn, setSignedIn] = useState(false);

  const currentUser = getAuth().currentUser;

  useEffect(() => {
    // const pauseHandler = () => {
    //   if (pauseResumeButton.current) {
    //     swapCssClass(pauseResumeButton.current, "unpaused", "paused");
    //   }
    // };
    // const resumeHandler = () => {
    //   if (pauseResumeButton.current) {
    //     swapCssClass(pauseResumeButton.current, "paused", "unpaused");
    //   }
    // };
    // const newGameHandler = () => {
    //   forceUpdate(1);
    // }
    // document.addEventListener("new_game", newGameHandler);
    // document.addEventListener("game_pause", pauseHandler);
    // document.addEventListener("game_resume", resumeHandler);

    screen.orientation.onchange = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeaderHeight(getRootStyle("--header-logo-height"));
        });
      });
    }
    const onResize = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeaderHeight(getRootStyle("--header-logo-height"));
        });
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      // document.removeEventListener("new_game", newGameHandler);
      // document.removeEventListener("game_pause", pauseHandler);
      // document.removeEventListener("game_resume", resumeHandler);
      screen.orientation.onchange = null;
      window.removeEventListener("resize", onResize);

    }

  }, []);


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
    forceUpdate(1);
  }, [currentUser, userState.user,
    // gameState.props.gamePaused, gameState.props.gameReset, gameState.props.showOptions
  ]);

  return (

    <header id={ props.id } data-layout={ props.layout } className={ `app-header tw-h-16` } style={ { zIndex: 5000 } }>
      <div className="tw-flex tw-ga">
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
        { props.leftNav !== "none" &&
          <nav className={ `nav-item left tw-h-auto tw-z-50 tw-bg-slate-600` }>
            <div ref={ pauseResumeButton } className={ `nav-icon settings ${settingsState.showOptions ? 'open' : 'closed'}` }
              onClick={ () => {
                if (settingsState.showOptions === true) {
                  // gameState.api.hideOptions();
                  setSettingsStore(Commands.OPTIONS_HIDE);
                }
                else {
                  // gameState.api.showOptions();
                  setSettingsStore(Commands.OPTIONS_SHOW);

                }
              } }>
              {/* if (gameState.props.gamePaused === true) {
                gameState.api.resumeGame();
              }
              else {
                gameState.api.pauseGame();
              }
            } }> */}

            </div>
          </nav>
        }
      </div>
      <Link href={ PATH_HOME } style={ { display: "block" } }>
        <TetrisLogoSvg id="HeaderSVG"
          // strokeColor='#89A6D3' 
          strokeColor='#999'
          strokeLinecap='round'
          strokeLinejoin='round'
          fillColor="#00000000"
          fillOpacity={ 1 }
          strokeWidth={ true ? "0.25rem" : "0.2rem" }
          height={ headerHeight }

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

  const [showProfileModal, setShowProfileModal] = useState(false);
  return (
    <>
      <nav id={ props.id } data-layout={ props.layout } data-orientation={ screen.orientation } className={ `nav-item right tw-h-auto tw-z-50 tw-bg-slate-600` }>
        {/* <Link className="active tw-text-blue-500 tw-text-2xl tw-bg-slate-500 tw-w-24" href="/" style={{display: "block"}}>
          Home
        </Link> */}

        { userState.user &&

          <div className="active tw-text-blue-500 tw-text-2xl tw-bg-slate-500" onClick={ () => {
            setShowProfileModal(!showProfileModal);
          } } style={ { display: "block" } }>
            <div className="nav-icon user-icon" style={ {
              backgroundImage: `url("${userState.user?.photoURL}")`
            } }>
              { !userState.user?.photoURL &&
                userState.user?.displayName?.substring(0, 1).toUpperCase()
              }
            </div>
          </div>
        }
        { !userState.user &&
          <div className="active tw-text-blue-500 tw-text-2xl tw-w-24 tw-bg-slate-500" onClick={ () => {
            setShowProfileModal(!showProfileModal);
          } } style={ { display: "block" } }>
            Sign In
          </div>
        }
        {/* <Link className="active tw-text-blue-500 tw-text-2xl tw-w-24 tw-bg-slate-500" href="/signup" style={{display: "block"}}>
          Sign Up
        </Link> */}
        {/* <Link href="/notfound">NotFound</Link> */ }
      </nav>
      <ModalNav type={ "profile" } show={ showProfileModal } />
    </>
  );
}
