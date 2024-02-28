import { createContext } from "preact";
import { useReducer } from "preact/hooks";
import { newUID } from "./utils/AppUtil";
import { Auth, User, getAuth } from "firebase/auth";

import { Firestore, addDoc, collection, getFirestore } from 'firebase/firestore';
import { FirebaseApp, initializeApp } from "firebase/app";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8JwDY65KIkmQlF-_8r4OfDCXHAOExf_8",
  authDomain: "preacttetris.firebaseapp.com",
  projectId: "preacttetris",
  storageBucket: "preacttetris.appspot.com",
  messagingSenderId: "565558573654",
  appId: "1:565558573654:web:b177a05d715b774621d9f7",
  measurementId: "G-B0NBKWX8WT"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
// const analytics: Analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
const db: Firestore = getFirestore(app);

interface ReducerAction {
  type: string,
  payload?: any,
}

async function connect() {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      first: "Devon",
      last: "Quinn",
      born: 1984
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

connect();

// // Import the functions you need from the SDKs you need
// import { FirebaseApp, initializeApp } from "firebase/app";
// import { Analytics, getAnalytics, logEvent } from "firebase/analytics";
// import { getFirestore } from "firebase/firestore";
// import { Firestore } from 'firebase/firestore/lite';
// import { collection, addDoc } from "firebase/firestore"; 
// import { getAuth } from "firebase/auth";


export interface PiecePoints {
  base: number;
  softDrop: number;
  hardDrop: number;
  combo: number;
  tSpin: number;
  total: number;
  backToBack: number;
  levelMultiplier: number;
}
export interface PieceMove {
  linesCleared: number;
  comboCount: number;
  pieceType: number;
  points: PiecePoints;
  timeStart: number;
  timeEnd: number;
}

export interface GameState {
  timeStart: number;
  elapsedTime: number;
  timeEnd: number | undefined;

  stats: {
    level: number;
    lines: number;
    score: number;
    pieceMoves: PieceMove[];
  };
  gamePaused: boolean;
  gameOver: boolean;
  gameSpeed: number;
  startingLevel: number;

  gameMode: "marathon" | "time_attack" | "campaign";
}

export interface GameStateAPI extends GameState {
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void; // TODO: wire up
  updateStats: (stats: any) => void;
  saveResults: () => void;
}
const initialGameState: GameState = {
  stats: {
    level: 1,
    lines: 0,
    score: 0,
    pieceMoves: [],
  },
  gameOver: false,
  gamePaused: false,
  gameSpeed: 1,
  startingLevel: 1,
  gameMode: "marathon",
  timeStart: Date.now(),
  elapsedTime: 0,
  timeEnd: undefined,
}

const appReducer = (state: GameState, action: ReducerAction) => {
  console.log("appReducer Called");
  switch (action.type) {
    case 'PAUSE': {
      return {
        ...state,
        gamePaused: true
      };
    }
    case 'RESUME': {
      return {
        ...state,
        gamePaused: false
      };
    }
    case 'UPDATE_STATS': {
      let newState = { ...state };
      newState.stats.level = action.payload.level;
      newState.stats.lines = action.payload.lines;
      newState.stats.score = action.payload.score;
      newState.stats.pieceMoves.push(action.payload.pieceMove);
      return newState;
    }
    case 'SAVE_RESULTS': {
      let obj: any = {};
      Object.keys(state).forEach((key: string) => {
        if (key !== "pauseGame" && key !== "resumeGame" && key !== "updateStats") {
          obj[key] = (state as any)[key];
        }
      });

      console.log("Saving Results...");
      const gameId = newUID();  // TODO: move into initial state;
      const gameResults = JSON.stringify(obj);
      localStorage.setItem(gameId, gameResults);
      console.log(gameResults);
      return state;
    }
    case 'RESTART': {
      return {
        ...JSON.parse(JSON.stringify(initialGameState)),
        timeStart: Date.now()
      };
    }
    default: {
      return state;
    }
  }
};

export const AppContext = createContext<GameState>(initialGameState);

interface ProviderProps {
  children: any[];
}
export default function AppProvider(props: ProviderProps) {
  const { children } = props;
  const [state, dispatch] = useReducer(appReducer, initialGameState);

  const pauseGame = () => {
    dispatch({
      type: 'PAUSE'
    });
  };

  const resumeGame = () => {
    dispatch({
      type: 'RESUME'
    });
  }

  const restartGame = () => {
    dispatch({
      type: 'RESTART'
    });
  }

  const updateStats = (stats: any) => {
    dispatch({
      type: 'UPDATE_STATS',
      payload: stats,
    });
  }
  const saveResults = () => {
    dispatch({
      type: 'SAVE_RESULTS',
    });
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        pauseGame,
        resumeGame,
        restartGame,
        updateStats,
        saveResults
      } as GameStateAPI}
    >
      {children}
    </AppContext.Provider>
  );
}

/*

USER PROVIDER

*/

const initialUserState: UserState = {
  user: null,
  preferences: {},
};

export interface UserState {
  user: User | null,
  preferences: any,
}
 export interface UserStateAPI extends UserState {
  setUser: (user: any) => void;
  clearUser: () => void;
 }

const userReducer = (state: UserState, action: ReducerAction) => {
  switch (action.type) {
    case 'SET_USER': {
      return {
        ...state,
        user: {...action.payload}
      };
    }
    case 'CLEAR_USER': {
      return {
        ...state,
        user: null
      };
    }
    default: {
      return state;
    }
  }
}

export const UserContext = createContext<UserState>(initialUserState);

export function UserProvider(props: ProviderProps) {
  const { children } = props;
  const [state, dispatch] = useReducer(userReducer, initialUserState);

  const setUser = (user: any) => {
    dispatch({
      type: 'SET_USER',
      payload: user
    });
  };
  const clearUser = () => {
    dispatch({
      type: 'CLEAR_USER',
    });
  };

  return (
    <UserContext.Provider
      value={{
        ...state,
        setUser,
        clearUser,
      } as UserStateAPI}
    >
      {children}
    </UserContext.Provider>
  );
}

export const samepleUserData: any = { 
  "uid": "DHrOIrNYzLOYIKSGXIiMIlZRsPK2", 
  "email": "aanika.quinn@gmail.com", 
  "emailVerified": true, 
  "displayName": "aanika quinn", 
  "isAnonymous": false, 
  "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocJII3w4FFmYX-YDFZtJo3hrQWWjEOFAoESJ5HrB0hs_=s96-c", 
  "providerData": [
    { 
      "providerId": "google.com", 
      "uid": "113292800547509447818", 
      "displayName": "aanika quinn", 
      "email": "aanika.quinn@gmail.com", 
      "phoneNumber": null, 
      "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocJII3w4FFmYX-YDFZtJo3hrQWWjEOFAoESJ5HrB0hs_=s96-c" 
    }
  ], 
  "stsTokenManager": { 
    "refreshToken": "AMf-vBwPLMhkSHX9kDu_WjMpKQ2j1O5_ja4Mev_thmsbB1bo6xyTYvZeP2P3F-aU6vH3V5_kiEfJcuIq8wReF_mFzvxFr5KA8_chNBWVyS5loJxnO0uamK8kbZr_ZbK6youz6OE1KYzVo6yHKcUSUiEazy5quHQ2PofVoU3wB4HXLGa9aEeVzL-ulFs2uL3yxQOrak3hhjt3d1xFXg1fTaWo3gJAk7Z1WDOzmt3t6nd-lAZQ94sOJ2SlHHPgcrSFP8VZzdZn0di7J_W3LzNWtU25MsEgxPMx1h-bMqfGitvfp-kOvTjEjdChtIlCZccFOYoHPFQVl4T6o2BujLeKpnpOASmnzN7SeMXUSQOIrU4cGJu4XJccGMkMLHMWaLC35LcL12KUrt2TBwgdOsWNa7JlUFswcXTUQb0HonkPZtMFasYNAy9ndvo", "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjNiYjg3ZGNhM2JjYjY5ZDcyYjZjYmExYjU5YjMzY2M1MjI5N2NhOGQiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiYWFuaWthIHF1aW5uIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pJSTN3NEZGbVlYLVlERlp0Sm8zaHJRV1dqRU9GQW9FU0o1SHJCMGhzXz1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9wcmVhY3R0ZXRyaXMiLCJhdWQiOiJwcmVhY3R0ZXRyaXMiLCJhdXRoX3RpbWUiOjE3MDkwNjQzNTcsInVzZXJfaWQiOiJESHJPSXJOWXpMT1lJS1NHWElpTUlsWlJzUEsyIiwic3ViIjoiREhyT0lyTll6TE9ZSUtTR1hJaU1JbFpSc1BLMiIsImlhdCI6MTcwOTA2NDM1NywiZXhwIjoxNzA5MDY3OTU3LCJlbWFpbCI6ImFhbmlrYS5xdWlubkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzI5MjgwMDU0NzUwOTQ0NzgxOCJdLCJlbWFpbCI6WyJhYW5pa2EucXVpbm5AZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.qWwChHLY6NlNC5BtNHlD75I09YZbNkiRLds35JPzmt37WuvV0vevjEKw9Ax6qMtUrJ8T7P1dVDyMXdBLcWntALPGbmLH86EoKnXpd9bRrQvg-eu3OoK8rJMe1SqbSqHxSPTGZuc7wi9iQAPNWa3XlbWJZpdmY-cScruajXcKEmFd9K2QmlUcqmpBEe9t-OyoKXcqmHd_fU8nmuXb35d74uSlWldAABHZAUmaAOKQsagVkAj_RRK8CqQ0UyNHo8n391gEh0L2R3PQeb1TixuuMz_nEvbf5ebTdpuQ0dH5DY4xdgXsEIkegpIW1XN-1H4c9xZd7gANlLGKt7VyFWYM3g", 
    "expirationTime": 1709067957841 
  }, 
  "createdAt": "1709063972020", 
  "lastLoginAt": "1709064326052", 
  "apiKey": "AIzaSyA8JwDY65KIkmQlF-_8r4OfDCXHAOExf_8", 
  "appName": "[DEFAULT]" 
};