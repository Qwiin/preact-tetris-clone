import { GameAction } from "../TetrisConfig";

interface ActionToastProps {
  actions: GameAction[];
}
export function ActionToast(props: ActionToastProps) {
  return (
    <div className="tw-flex tw-items-center tw-h-14 tw-p-0 tw-w-full tw-justify-center">
      <div className='tw-relative tw-w-80 tw-h-14 tw-max-w-80'>
        {(props.actions &&
        (props.actions || [{text: "Action", points: "1,000,000"}]).map((action: GameAction)=>{ return (
          <>
          <div key={action.id} 
            // onAnimationEnd={()=> action.transitioning = false} 
            className={`tw-w-full tw-flex tw-font-mono tw-text-amber-600 tw-justify-center tw-items-center tw-absolute tw-top-0 tw-opacity-1 ${ action.transitioning ? "tw-opacity-1 action-fade-out" : "tw-opacity-0"}`}>
            <h2 className="tw-m-0 tw-py-2 tw-font-thin">{action.text}</h2>
          </div>
          <div key={action.id + 'b'} 
            className={`tw-font-extrabold tw-font-mono tw-w-full tw-flex tw-justify-center tw-items-center tw-absolute tw-top-0 tw-left tw-opacity-1 ${ action.transitioning ? "tw-opacity-1 action-fade-out2" : "tw-opacity-0"}`}>
            <h2 className="tw-m-0 tw-py-2 tw-font-thin tw-text-green-500">+{action.points}</h2>
          </div>
          </>
        );
        }))}
      </div>
    </div>
  );
}

export default ActionToast;