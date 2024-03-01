import { useContext, useState } from "preact/hooks";

import {
  signInWithPopup,
  GoogleAuthProvider,
  getAuth,
  UserCredential,
  User
} from "firebase/auth";

import SignInWithGoogleLight from './assets/SignInWithGoogleLight';
import { AppContext, GameState, UserContext, UserState } from "./AppProvider";
import { Link, route } from "preact-router";
import { PATH_HOME, PATH_LOGIN } from "./App2";

export const GoogleSignUp = () => {
  const [error, setError] = useState(false);
  const [googleErrorMessage, setGoogleErrorMessage] = useState("");

  const userState: UserState = useContext(UserContext);
  const appState: GameState = useContext(AppContext);

  // Instantiate the auth service SDK
  const auth = getAuth();

  // Handle user sign up with google
  const handleGoogleSignUp = async (e: any) => {
    e.preventDefault();

     // Instantiate a GoogleAuthProvider object
    const provider = new GoogleAuthProvider();
    
    try {
      // Sign in with a pop-up window
      const result: any = await signInWithPopup(auth, provider);
      

      // Pull signed-in user credential.
      const user: User = result.user;

      console.log(appState);

      if(userState.setUser){
        userState.setUser({...getAuth().currentUser});
      }
      
      route(PATH_HOME, true);

    } catch (err: any) {
      // Handle errors here.
      const errorMessage = err.message;
      const errorCode = err.code;

      setError(true);

      switch (errorCode) {
        case "auth/operation-not-allowed":
          setGoogleErrorMessage("Email/password accounts are not enabled.");
          break;
        case "auth/operation-not-supported-in-this-environment":
          setGoogleErrorMessage("HTTP protocol is not supported. Please use HTTPS.")
          break;
        case "auth/popup-blocked":
          setGoogleErrorMessage("Popup has been blocked by the browser. Please allow popups for this website.")
          break;
        case "auth/popup-closed-by-user":
          setGoogleErrorMessage("Popup has been closed by the user before finalizing the operation. Please try again.")
          break;
        default:
          setGoogleErrorMessage(errorMessage);
          break;
      }
    }
  };

  return (
    <div id="GoogleSignUp" className="signup-container tw-flex tw-items-center tw-justify-center tw-h-full tw-w-full">
      <div className='signupContainer__box__google'>
        <button onClick={handleGoogleSignUp}>
          <span>
            <SignInWithGoogleLight/>
          </span>
            Sign Up with Google
        </button>
          {error && <p>{googleErrorMessage}</p>}
      </div>

      <div className='signupContainer__box__login'>
        <p>
          Already have an account? 
          <Link className="active" href={PATH_LOGIN}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
    //   </div>
    // </div>
  );
};

export default GoogleSignUp;