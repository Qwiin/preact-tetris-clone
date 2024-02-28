import { Link } from "preact-router";
// import { CSSColors } from "./BaseTypes";
import { TetrisLogoSvg } from "./components/TetrisLogoSvg";
import { useContext, useEffect, useState } from "preact/hooks";
import { Auth, getAuth } from "firebase/auth";
import { PATH_HOME, PATH_LOGIN, PATH_PROFILE, PATH_SIGNUP } from "./App2";
import { UserContext } from "./AppProvider";

export default function AppHeader() {

  const userState = useContext(UserContext);
  // const [signedIn, setSignedIn] = useState(false);

  const currentUser = getAuth().currentUser;

  return (

    <header className={`app-header tw-h-16`} style={{zIndex:5000}}>
      <nav className={`nav-item left tw-h-auto tw-z-50 tw-bg-slate-600`}>
      <div className="nav-icon settings">

      </div>
      </nav>
      
      <Link href={PATH_HOME} style={{display: "block"}}>
        <TetrisLogoSvg id="HeaderSVG"
              // strokeColor='#89A6D3' 
              strokeColor='#999' 
              strokeLinecap='round' 
              strokeLinejoin='round' 
              fillColor="#00000000" 
              fillOpacity={1} 
              strokeWidth={true ? "0.25rem" : "0.2rem"} 
              height={true ? "5.2rem" : "5.5rem"}
              letterFilter={ 
                // undefined
                'url(#shadow2)'
              }
              ></TetrisLogoSvg>
          </Link>
      <nav className={`nav-item right tw-h-auto tw-z-50 tw-bg-slate-600`}>
        {/* <Link className="active tw-text-blue-500 tw-text-2xl tw-bg-slate-500 tw-w-24" href="/" style={{display: "block"}}>
          Home
        </Link> */}

        {userState.user && 
            
            <Link className="active tw-text-blue-500 tw-text-2xl tw-w-24 tw-bg-slate-500" href={PATH_PROFILE} style={{display: "block"}}>
            <div className="nav-icon user-icon" style={{
              backgroundImage: `url("${userState.user?.photoURL}")`
            }}>
              {!userState.user?.photoURL &&
                userState.user?.displayName?.substring(0,1).toUpperCase()
              }
            </div>
             </Link>
        }
        {!currentUser &&
          <Link className="active tw-text-blue-500 tw-text-2xl tw-w-24 tw-bg-slate-500" href={PATH_SIGNUP} style={{display: "block"}}>
            Sign In
          </Link>
        }
        {/* <Link className="active tw-text-blue-500 tw-text-2xl tw-w-24 tw-bg-slate-500" href="/signup" style={{display: "block"}}>
          Sign Up
        </Link> */}
        {/* <Link href="/notfound">NotFound</Link> */}
      </nav>
    </header>
  );

}