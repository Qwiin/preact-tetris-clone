import { useCallback } from "preact/hooks";
import { AppState, useStore } from "./AppStore";


/**
 * 
 * Interfaces
 *  
 */

export interface SettingsSlice {
  showOptions: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  isDevPanelOn: boolean;
  isNewTouchEnabled: boolean;
}

/**
 * 
 * InitialState
 *  
 */

export const initialSettingsState = {
  showOptions: false,
  soundEnabled: false,
  musicEnabled: false,
  isDevPanelOn: false,
  isNewTouchEnabled: false,
}


/**
 * 
 * @Local_Types
 * This file is context specific, so for me
 * local generic types are better for 
 * readability
 * 
 * @type Slice: Partial<AppState> refers to some first-level Parial of AppState
 * @type Sliver - is some Partial<Slice>
 */

type Slice = SettingsSlice;
type Sliver = Partial<Slice>;

/**
 * 
 * @Store_Selector
 * @param state 
 * @returns 
 * 
 */
function settingsSelector(state: AppState): Slice {
  return state.settings;
}

/**
 * 
 * @Store_Hook
 * @returns [<SettingsSlice>, (value: Setting) => void]
 * 
 */

// returns the [gameSlice, store.set]
export function useSettingsStore(): [Slice, (value: Sliver) => void] {
  const [settingsSlice, storeSet] = useStore(settingsSelector);
  const setSettings = useCallback(
    (value: Sliver) => {
      storeSet({ settings: value } as Partial<AppState>)
    }, []);

  return [settingsSlice, setSettings];
}



/**
 * 
 * @Store_Helpers
 *  
 */

export abstract class Commands {
  public static NEW_TOUCH_ON: Sliver = { isNewTouchEnabled: true };
  public static NEW_TOUCH_OFF: Sliver = { isNewTouchEnabled: false };
  public static DEV_PANEL_ON: Sliver = { isDevPanelOn: true };
  public static DEV_PANEL_OFF: Sliver = { isNewTouchEnabled: false };
  public static MUSIC_ON: Sliver = { musicEnabled: true };
  public static MUSIC_OFF: Sliver = { musicEnabled: false };
  public static SOUND_ON: Sliver = { soundEnabled: true };
  public static SOUND_OFF: Sliver = { soundEnabled: false };
  public static OPTIONS_SHOW: Sliver = { showOptions: true };
  public static OPTIONS_HIDE: Sliver = { showOptions: false };
}
