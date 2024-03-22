import { useCallback, useContext, useRef } from "preact/hooks";
import { newUID } from "../utils/AppUtil";
import { ReactNode, createContext, useSyncExternalStore } from "preact/compat";
import { StatsSlice } from "./StatsStore";
import { SettingsSlice } from "./SettingsStore";
import { GameSlice } from "./GameStore";
import { UserSlice } from "./UserStore";
import { initialGameState, initialSettingsState, initialStatsState, initialUserState } from "./InitialStates";


type SubscribeType = (callback: () => void) => (() => void);

interface StoreAPI<T> {
  get: () => T;
  set: (value: Partial<T>) => void;
  subscribe: SubscribeType
}

export interface AppState {
  sessionId: string,
  game: GameSlice,
  stats: StatsSlice,
  settings: SettingsSlice,
  user: UserSlice,
}

export const initialAppState: AppState = {
  sessionId: newUID(),
  game: initialGameState,
  stats: initialStatsState,
  settings: initialSettingsState,
  user: initialUserState,
}

export function createQuickContext<T>(initialState: T) {
  /**
   * custom store hook
   * @param initialState 
   * @returns 
   */
  // function useStoreData(): StoreAPI<T> {
  function useStoreData(): {
    get: () => T;
    set: (value: Partial<T>) => void;
    subscribe: (callback: () => void) => (() => void);
  } {

    const store = useRef(initialState);

    const get = useCallback(() => store.current, []);

    const set = useCallback(
      (value: Partial<T>) => {
        // console.log("**** useStoreData.set() called with:");
        // console.log(JSON.stringify(value));
        store.current = { ...store.current, ...value };
        subscribers.current.forEach((callback) => callback());
      }, []);

    // using a js <Set> will only ensure only unique subsribers are added
    const subscribers = useRef(new Set<() => void>);
    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => {
        subscribers.current.delete(callback);
      }
    }, []);

    return { get, set, subscribe } as StoreAPI<T>;
  }

  type UseStoreDataType = ReturnType<typeof useStoreData>
  const StoreContext = createContext<UseStoreDataType | null>(null);

  /**
   * 
   * @param selector - optional - function that returns a takes passes in the AppState <T> 
   *                              and returns a Slice of type <S> (i.e. Partial<AppState>);
   * 
   * @typeParam <S> - Slice typically a first-level Partial of the root store state
   * @remarks SettingsSlice, GameSlice, UserSlice... are example types for <S>
   * 
   * @typeParam <T> - Root Store State type - i.e. `<AppState>`
   * 
   * @returns 
   * 
   */

  function useStore<S = T>(selector?: (store: T) => S): [S, (value: Partial<T>) => void, SubscribeType] {

    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(`No Store Found for ${StoreContext}`)
    }

    const state = selector !== undefined
      ? useSyncExternalStore(store.subscribe, () => selector(store.get()))
      : useSyncExternalStore(store.subscribe, () => store.get());

    // // useSyncExternalStore(...) effectively does this:
    // const [state, setState] = useState(store.get());
    // useEffect(() => {
    //   return store.subscribe(() => setState(store.get()));
    // }, []);

    return [state as S, store.set, store.subscribe];
  }

  function Provider({ children }: { children: ReactNode }) {
    const store = useStoreData();

    return (
      <StoreContext.Provider value={ store }>
        { children }
      </StoreContext.Provider>
    );
  }

  return {
    Provider,
    useStore
  };

}

export const { Provider, useStore } = createQuickContext(initialAppState);


// returns the entire app state;
export function useAppStore() {
  return useStore();
}
