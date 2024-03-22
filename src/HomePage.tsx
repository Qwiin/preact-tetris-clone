import { useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { UserContext, UserState } from './AppProvider';
import { App } from './app';
import { useUserStore } from './store/UserStore';
import { initialUserState } from './store/InitialStates';

const HomePage = () => {

  // const { paused, reset } = useAppStore(gameSelector);
  // const userState: UserState = useContext(UserContext);
  const [userState, setUserState] = useUserStore();

  useEffect(() => {
    onAuthStateChanged(getAuth(), (user) => {
      if (user && !userState.userInfo) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
        console.log("uid", uid);

        setUserState({ ...userState, userInfo: user.toJSON() });

      } else {
        setUserState({ ...initialUserState });
        // User is signed out
        // ...
        console.log("user is logged out")
      }
    });

  }, []);

  return (<>
    <App />
  </>);
}

export default HomePage;
