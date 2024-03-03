import { useEffect } from 'preact/hooks';
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { UserContext, UserState } from './AppProvider';
import { App } from './app';

const HomePage = () => {

  // const userState: UserState = useContext(UserContext);

  useEffect(() => {
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
        console.log("uid", uid)
      } else {
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
