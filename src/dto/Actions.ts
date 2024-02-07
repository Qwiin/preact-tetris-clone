import { ActionType, GameAction } from "../TetrisConfig";

const BACK_TO_BACK: GameAction = {
  type: ActionType.BACK_TO_BACK,

  textSequence: ["Back", "to", "Back"], // 1,2,3
  textSequenceJoin: "-", // 4
  subtext: "1.5x",
  transitioning: true,
}

export const createByType = (type: ActionType) => {
  
  const id = Math.round(performance.now() * 1000000).toString();

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