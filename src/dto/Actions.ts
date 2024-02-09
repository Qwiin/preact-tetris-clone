import { ActionType, GameAction } from "../TetrisConfig";
import { newUID } from "../utils/AppUtil";

const BACK_TO_BACK: GameAction = {
  type: ActionType.BACK_TO_BACK,
  classNames: ['back-to-back'],
  textSequence: ["Back", "to", "Back"], // 1,2,3
  textSequenceJoin: "-", // 4
  subtext: "1.5x",
  transitioning: true,
}

export const createByType = (type: ActionType) => {
  
  const id = newUID();

  let gameAction: GameAction | null = null;
  
  switch(type) {
    case ActionType.BACK_TO_BACK:
      gameAction = BACK_TO_BACK;
      break;
  }

  if(!gameAction) {
    console.error('gameAction is not defined');
  }

  return Object.assign(JSON.parse(JSON.stringify(gameAction)),{id});
}