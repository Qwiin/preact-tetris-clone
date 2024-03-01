import { getAuth, signOut } from "firebase/auth";
import { route } from "preact-router";
import { PATH_HOME } from "./App2";
import { useContext } from "preact/hooks";
import { UserContext, UserStateAPI } from "./AppProvider";

const Profile = () => {

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const userState = useContext(UserContext) as UserStateAPI;
  
  const renderProfile = () => {

    const keys = Object.keys(currentUser || {});
    const values = Object.values(currentUser || {});
    

    const items = keys.map((key: string, index: number)=>{
        return (<>
          <div style={{width: "20rem", height: "10rem", overflow: "scroll", touchAction: "auto", userSelect: "auto"}}>
            <p className="tw-text-left" style={{fontWeight: "bold"}}>{key}</p>
            <p className="tw-text-left">{typeof values[index] !== "object" ? values[index] : JSON.stringify(values[index])}</p>
          </div>
        </>);
      }
    );
    return items;
  }

  const signOutHandler = () => {

    // purge local state
    if(userState.clearUser) { 
      userState.clearUser(); 
    }

    signOut(auth).then(()=>{
      route(PATH_HOME,true);
    });
  }

  return (
    <div class="profile tw-overflow-scroll" style={{position: "absolute",top:"10%", bottom: "10%",touchAction: "auto", userSelect: "auto", overflow: "scroll"}}>
    <h2>Profile: {currentUser?.displayName || 'Anonymous'}</h2>
    
    <button onClick={signOutHandler}>Sign Out</button>   
    
    { currentUser &&
        renderProfile()
    }
    </div>
  );
}

export default Profile;
