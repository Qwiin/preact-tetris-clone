import { createContext } from "preact";
import { useReducer } from "preact/hooks";
import { newUID } from "./utils/AppUtil";

export interface GameState {
  timeStart: number;
  elapsedTime: number;
  timeEnd: number | undefined;

  stats: {
    level: number;
    lines: number;
    score: number;
    pieceMoves: {
      pieceType: string;
      points: {
        base: number;
        softDrop: number;
        hardDrop: number;
        combo: number;
        tSpin: number;
        total: number;
      }
      basePoints: number;
      backToBack: number;
      comboCount: number;
      timeStart: number;
      timeEnd: number;
    }[];
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