import { createContext } from "preact";
import { useReducer } from "preact/hooks";
import { newUID } from "./utils/AppUtil";
import { User, getAuth } from "firebase/auth";

import { Firestore, getFirestore, addDoc, collection } from 'firebase/firestore';
import { FirebaseApp, initializeApp } from "firebase/app";
import { RESUME_DELAY } from "./components/Game";


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
// const analytics: Analytics = getAnalytics(app);
// Initialize Cloud Firestore and get a reference to the service

interface ReducerAction {
  type: string,
  payload?: any,
}

const db: Firestore = getFirestore(app);


// connect();

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
  iter: number;
  props: {
    timeStart: number;
    timePauseStart: number;
    timePausedTotal: number;
    timeGameTotal: number; // elapsed time (in ms) of unpaused gameplay;
    timeEnd: number;

    stats: {
      level: number;
      lines: number;
      score: number;
      pieceMoves: PieceMove[];
    };
    showOptions: boolean;
    gameReset: boolean;
    gamePaused: boolean;
    gameOver: boolean;
    gameSpeed: number;
    startingLevel: number;
    isSoundOn: boolean;
    isMusicOn: boolean;
    isDevPanelOn: boolean;
    gameMode: "marathon" | "time_attack" | "campaign";
  };
}



const initialGameState: GameState = {
  iter: 0,
  props: {
    stats: {
      level: 1,
      lines: 0,
      score: 0,
      pieceMoves: [],
    },
    gameOver: false,
    gamePaused: false,
    gameReset: false,
    gameSpeed: 1,
    showOptions: false,
    startingLevel: 1,
    gameMode: "marathon",
    timeStart: Date.now(),
    timePauseStart: 0,  // Date - marking time pause was initiated;
    timePausedTotal: 500,  // when unpaused, the pause duration is calculated and added to this field;
    timeGameTotal: 0,
    timeEnd: 0,
    isSoundOn: false,
    isMusicOn: false,
    isDevPanelOn: false,
  }
}
export interface GameStateAPI extends GameState {
  api: {
    pauseGame: () => void;
    resumeGame: () => void;
    resetGame: () => void;
    gameOver: () => void;
    enableMusic: (value: boolean) => void;
    enableSound: (value: boolean) => void;
    enableDevPanel: (value: boolean) => void;
    // setSoundVolume(value: number) => void;

    resetComplete: () => void;
    showOptions: () => void;
    hideOptions: () => void;
    addToScore: (value: number) => void;  // optimized method for updating score during soft drop
    updateStats: (stats: any) => void;
    saveResults: () => void;
    stats: () => void;
  }
}

const appReducer = (state: GameState, action: ReducerAction) => {
  console.log("appReducer Called");
  switch (action.type) {
    case 'PAUSE': {
      if (state.props.gamePaused !== true) {
        document.dispatchEvent(new CustomEvent("game_pause"));
        const newState = { ...state };
        newState.iter += 1;
        newState.props.timePauseStart = Date.now();
        newState.props.gamePaused = true;
        return newState;
      }
      break;
    }
    case 'RESUME': {
      if (state.props.gamePaused === true) {
        document.dispatchEvent(new CustomEvent("game_resume"));
        const newState = { ...state };
        newState.iter += 1;
        newState.props.timePausedTotal += Date.now() - state.props.timePauseStart + RESUME_DELAY;
        console.log(`timePausedTotal: ${newState.props.timePausedTotal}`);
        newState.props.gamePaused = false;
        return newState;
      }
      break;
    }
    case 'ADD_TO_SCORE': {
      // const newState = { ...state };
      // state.iter += 1;
      state.props.stats.score += action.payload;
      return state;
    }
    case 'UPDATE_STATS': {
      const newState = { ...state };
      newState.iter += 1;
      newState.props.stats.level = action.payload.level;
      newState.props.stats.lines = action.payload.lines;
      newState.props.stats.score = action.payload.score;
      newState.props.stats.pieceMoves.push(action.payload.pieceMove);
      return newState;
    }
    case 'ENABLE_SOUND': {
      if (state.props.isSoundOn !== action.payload) {
        const newState = { ...state };
        newState.iter += 1;
        newState.props.isSoundOn = action.payload;
        return newState;
      }
      break;
    }
    case 'ENABLE_MUSIC': {
      if (state.props.isMusicOn !== action.payload) {
        const newState = { ...state };
        newState.iter += 1;
        newState.props.isMusicOn = action.payload;
        return newState;
      }
      break;
    }
    case 'ENABLE_DEV_PANEL': {
      if (state.props.isDevPanelOn !== action.payload) {
        const newState = { ...state };
        newState.iter += 1;
        newState.props.isDevPanelOn = action.payload;
        return newState;
      }
      break;
    }
    case 'SHOW_OPTIONS': {
      if (state.props.showOptions !== true) {
        const newState = { ...state };
        newState.iter += 1;
        newState.props.showOptions = true;
        return newState;
      }
      break;
    }
    case 'HIDE_OPTIONS': {
      if (state.props.showOptions === true) {
        const newState = { ...state };
        newState.iter += 1;
        newState.props.showOptions = false;
        return newState;
      }
      break;
    }
    case 'UPDATE_STATS_SILENT': {
      const newState = state;
      newState.iter += 1;
      newState.props.stats.level = action.payload.level;
      newState.props.stats.lines = action.payload.lines;
      newState.props.stats.score = action.payload.score;
      newState.props.stats.pieceMoves.push(action.payload.pieceMove);
      return newState;
    }
    case 'GAME_OVER': {
      if (state.props.gameOver === false) {
        const newState = { ...state };
        newState.iter += 1;
        newState.props.gameOver = true;
        newState.props.timeEnd = Date.now();
        return newState;
      }
      break;
    }
    case 'SAVE_RESULTS': {
      let obj: any = {
        user_uid: getAuth().currentUser?.uid ?? 'anonymous',
        user_displayname: getAuth().currentUser?.displayName ?? 'anonymous'
      };
      Object.keys(state).forEach((key: string) => {
        if (key !== "pauseGame" && key !== "resumeGame" && key !== "updateStats") {
          obj[key] = (state as any)[key];
        }
      });

      console.log("Saving Results...");
      const gameId = newUID();  // TODO: move into initial state;
      const gameResults = JSON.stringify(obj);
      localStorage.setItem(gameId, gameResults);

      saveResults(state);

      console.log(gameResults);
      return state;
    }
    case 'RESET_GAME': {
      const newState: GameState = JSON.parse(JSON.stringify(
        {
          ...state,
          ...initialGameState,
        }));
      newState.props.timeStart = Date.now();
      newState.props.gamePaused = false;
      newState.props.gameOver = false;
      newState.props.gameSpeed = 1;
      newState.props.gameReset = true;
      // newState.props.gameReset = true;
      return newState;
    }
    case 'RESET_COMPLETE': {
      if (state.props.gameReset === true) {
        const newState = { ...state };
        newState.props.gameReset = false;
        return newState;
      }
      break;
    }
    default: {
      return state;
    }
  }
  return state;
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
  const gameOver = () => {
    dispatch({
      type: 'GAME_OVER'
    });
  }

  const resetGame = () => {
    dispatch({
      type: 'RESET_GAME'
    });
  }
  const resetComplete = () => {
    dispatch({
      type: 'RESET_COMPLETE'
    });
  }

  const showOptions = () => {
    dispatch({
      type: 'SHOW_OPTIONS'
    });
  }
  const hideOptions = () => {
    dispatch({
      type: 'HIDE_OPTIONS'
    });
  }
  const enableSound = (on: boolean) => {
    dispatch({
      type: 'ENABLE_SOUND',
      payload: on
    });
  }
  const enableMusic = (on: boolean) => {
    dispatch({
      type: 'ENABLE_MUSIC',
      payload: on
    });
  }
  const enableDevPanel = (on: boolean) => {
    dispatch({
      type: 'ENABLE_DEV_PANEL',
      payload: on
    });
  }

  const addToScore = (points: number) => {
    dispatch({
      type: 'ADD_TO_SCORE',
      payload: points
    });
  }
  // const updateStats = (stats: any) => {
  //   dispatch({
  //     type: 'UPDATE_STATS',
  //     payload: stats,
  //   });
  // }
  const updateStats = (stats: any) => {
    dispatch({
      type: 'UPDATE_STATS_SILENT',
      payload: stats,
    });
  }
  const saveResults = () => {
    dispatch({
      type: 'SAVE_RESULTS',
    });
  }

  const stats = () => {
    return state.props.stats;
  }


  return (
    <AppContext.Provider
      value={ {
        ...state,
        api: {
          pauseGame,
          resumeGame,
          gameOver,
          resetGame,
          resetComplete,
          addToScore,
          updateStats,
          saveResults,
          showOptions,
          hideOptions,
          enableSound,
          enableMusic,
          enableDevPanel,
          stats,
        }
      } as GameStateAPI }
    >
      { children }
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
        user: { ...action.payload }
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
      value={ {
        ...state,
        setUser,
        clearUser,
      } as UserStateAPI }
    >
      { children }
    </UserContext.Provider>
  );
}

async function saveResults(gameState: GameState) {
  const currentUser = getAuth().currentUser;
  let obj: any = {
    user_uid: currentUser?.uid ?? 'anonymous',
    user_displayname: currentUser?.displayName ?? 'anonymous'
  };

  try {
    const docRef = await addDoc(collection(db, "games"), {
      user_uid: obj.user_uid,
      user_displayname: obj.user_displayname,
      moves: gameState.props.stats.pieceMoves,
      final_score: gameState.props.stats.score,
      start_time: gameState.props.timeStart,
      end_time: gameState.props.timeEnd,
      pause_time: gameState.props.timePausedTotal,
      elapsed_time: gameState.props.timeEnd - gameState.props.timeStart - gameState.props.timePausedTotal,
      max_lvl: gameState.props.stats.level,
      lines_cleared: gameState.props.stats.lines,
      starting_lvl: gameState.props.startingLevel,
      game_mode: gameState.props.gameMode,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}


export const samepleUserData: any = {
  "uid": "DHrOIrNYzLOYIKSGXIiMIlZRsPK2",
  "email": "jane.doe@gmail.com",
  "emailVerified": true,
  "displayName": "jane doe",
  "isAnonymous": false,
  "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocJII3w4FklFYX-YDFZtJo3hrQWWjEOFAoESJ5HrB0hs_=s96-c",
  "providerData": [
    {
      "providerId": "google.com",
      "uid": "151413121110987654321",
      "displayName": "jane doe",
      "email": "jane.doe@gmail.com",
      "phoneNumber": null,
      "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocJII3w4klFYX-YDFZtJo3hrQWWjEOFAoESJ5HrB0hs_=s96-c"
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
