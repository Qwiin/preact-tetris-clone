import { createContext } from "preact";
import { useReducer } from "preact/hooks";
import { newUID } from "./utils/AppUtil";



// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { Firestore } from 'firebase/firestore/lite';

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
const analytics: Analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
const db: Firestore = getFirestore(app);

import { collection, addDoc } from "firebase/firestore"; 

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

logEvent(analytics, "page_view", {
  page_title: "Preact Tetris :: App Provider",
  page_path: "app.tsx",
  "log_data": {logValue: "this is a test log message"},
  "modifiable_param": "original-text"
});

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
  pauseGame?: ()=>void;
  resumeGame?: ()=>void;
  updateStats?: (stats:any)=>void;
  saveResults?: ()=>void;
  
  gameMode: "marathon" | "time_attack" | "campaign";
}
const initialState: GameState = {
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

const appReducer = (state: GameState, action: any) => {
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
      let newState = {...state};
      newState.stats.level = action.payload.level;
      newState.stats.lines = action.payload.lines;
      newState.stats.score = action.payload.score;
      newState.stats.pieceMoves.push(action.payload.pieceMove);
      return newState;
    }
    case 'SAVE_RESULTS': {
      let obj: any = {};
      Object.keys(state).forEach((key: string)=>{
        if(key !== "pauseGame" && key !== "resumeGame" && key !== "updateStats") {
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
    default: {
      return state;
    }
  }
};

export const AppContext = createContext<GameState>(initialState);

interface ProviderProps {
  children: any[];
}
export default function AppProvider( props: ProviderProps)  {
  const {children} = props;
  const [state, dispatch] = useReducer(appReducer, initialState);

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
        updateStats,
        saveResults
      }}
    >
      {children}
    </AppContext.Provider>
  );
}