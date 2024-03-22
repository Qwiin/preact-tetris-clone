import { useCallback } from "preact/hooks";
import { AppState, useStore } from "./AppStore";
import { UserInfo } from "firebase/auth";


/**
 * 
 * Interfaces
 * 
 */

export interface UserSlice {
  userInfo: UserInfo | any;
  preferences: any,
}

/**
 * 
 * @Store_Selector
 * 
 */

export const userSelector = (state: AppState): UserSlice => {
  return state.user;
}

/**
 * 
 * @Local_Types
 * This file is context specific, so for me
 * local generic types are better for 
 * readability
 * 
 * @type Slice: Partial<AppState> - refers to some first-level Parial of AppState
 * @type Sliver: Partial<Slice> - a slice of a slice
 */

type Slice = UserSlice;
type Sliver = Partial<Slice>;


/**
 * 
 * @Store_Hook
 * 
 */

export function useUserStore(): [Slice, (value: Sliver) => void] {

  const [UserSlice, storeSet] = useStore(userSelector);
  const setUserSlice = useCallback(
    (value: Sliver) => {
      storeSet({ user: value } as Partial<AppState>)
    }, []);

  return [UserSlice, setUserSlice];
}
