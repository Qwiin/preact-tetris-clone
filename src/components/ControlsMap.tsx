interface ControlsMapProps {
  clickCallback?: (e:any) => void;
  keyMoveLeft?: string;
  keyMoveRight?: string;
  keyMoveDown?: string;
  keyDropPiece?: string;
  keyRotateLeft?: string;
  keyRotateRight?: string;
  keyHoldPiece?: string;
}

const DEFAULT_KEY_MAP: ControlsMapProps = {
  keyMoveLeft: 'ArrowLeft',
  keyMoveRight: 'ArrowRight',
  keyMoveDown: 'ArrowDown',
  keyDropPiece: 'ArrowUp',
  keyRotateRight: 'Shift',
  keyRotateLeft: 'Alt',
  keyHoldPiece: 'Slash'
}

const KEY_CODE_MAP: any = {
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'Control': '^',
  'Shift': '⬆',
  'Alt': '⎇',
  'Slash': '/'
}

export function ControlsMap(props: ControlsMapProps) {

  return (
    <>
      <div className="game-control-map tw-flex tw-gap-1 tw-flex-col tw-justify-center tw-items-center tw-mt-8 tw-rounded-lg tw-px-1">

        <div className="tw-flex tw-gap-2 tw-flex-row tw-justify-center tw-items-center">
          <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text tw-flex tw-flex-col gap-0 tw-mt-4" 
          onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyRotateLeft})}}}
          style={{fontSize: '1.2rem'}}>
            <>↺</>
            <span class="tooltip-text top tw-flex-none tw-p-0">{props.keyRotateLeft} ({props.keyRotateLeft ? KEY_CODE_MAP[props.keyRotateLeft] : props.keyRotateLeft})</span>
          </div>
          <div className=" tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text tw-flex tw-flex-col gap-0 tw-items-center tw-justify-center"
          onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyHoldPiece})}}}>
            <><p className="tw-mt-2 tetris-font" style={{paddingLeft: "0rem",fontSize:"0.5rem", marginTop: "0.6rem"}}>Hold</p></>
            {/* <span class="tooltip-text top tw-flex-none tw-p-0">{props.keyHoldPiece} ({props.keyHoldPiece ? KEY_CODE_MAP[props.keyHoldPiece] : props.keyHoldPiece?.toString()})</span> */}
            <span class="tooltip-text top tw-flex-none tw-p-0">Slash ({props?.keyHoldPiece && (KEY_CODE_MAP[props.keyHoldPiece] || props.keyHoldPiece)})</span>
          </div>
          {/* <div className="tw-bg-gray-900 tw-rounded-md tw-shadow-inner tw-shadow-slate-400 tw-w-8 tw-h-8 hover-text"><>{KEY_CODE_MAP[props.keyDropPiece]}</>
            <span class="tooltip-text top tw-flex-none tw-p-0">Drop Piece</span>
          </div> */}
          <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text tw-flex tw-flex-col gap-0 tw-mt-4" 
          onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyRotateRight})}}}
          style={{fontSize: '1.2rem'}}>
            <>↻</>
            <span class="tooltip-text top tw-flex-none tw-p-0">{props.keyRotateRight} ({props.keyRotateRight ? KEY_CODE_MAP[props.keyRotateRight] : props.keyRotateRight})</span>
          </div>
        </div>
        <div className="tw-flex tw-gap-2 tw-flex-row tw-justify-center tw-items-center">
          <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text"
            onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyMoveLeft})}}}>
            <>{props?.keyMoveLeft && (KEY_CODE_MAP[props.keyMoveLeft] || props.keyMoveLeft)}</>
          <span class="tooltip-text bottom tw-flex-none tw-p-0">Move Left ({props?.keyMoveLeft && (KEY_CODE_MAP[props.keyMoveLeft] || props.keyMoveLeft)})</span>
          </div>
          <div className="tw-flex tw-gap-2 tw-flex-col tw-justify-center tw-items-center">
            <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text tw-flex tw-flex-col gap-0"
            style={{lineHeight:"1.25rem"}}
            onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyDropPiece})}}}>
              <>
                {props?.keyDropPiece && (KEY_CODE_MAP[props.keyDropPiece] || props.keyDropPiece)}
                <div className="tw-text-sm tw-text-s tw-p-0 tw-m-0 tetris-font" style={{paddingLeft: "0",marginTop: "-0.375rem",fontSize: '0.5rem'}}>Drop</div>
              </>
              <span class="tooltip-text top tw-flex-none tw-p-0">Drop Piece ({props?.keyDropPiece && (KEY_CODE_MAP[props.keyDropPiece] || props.keyDropPiece)})</span>
            </div>
            <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text"
              onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyMoveDown})}}}>
              <>{props?.keyMoveDown && (KEY_CODE_MAP[props.keyMoveDown] || props.keyMoveDown)}</>
              <span class="tooltip-text bottom tw-flex-none tw-p-0">Move Down ({props?.keyMoveDown && (KEY_CODE_MAP[props.keyMoveDown] || props.keyMoveDown)})</span>
            </div>
          </div>
          <div className="tw-bg-gray-900 tw-rounded-md game-control-button tw-w-8 tw-h-8 hover-text"
            onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyMoveRight})}}}>
            <>{props?.keyMoveRight && (KEY_CODE_MAP[props.keyMoveRight] || props.keyMoveRight)}</>
            <span class="tooltip-text bottom tw-flex-none tw-p-0">Move Right ({props?.keyMoveRight && (KEY_CODE_MAP[props.keyMoveRight] || props.keyMoveRight)})</span>
            </div>
        </div>
      </div>
    </>
  );
};
ControlsMap.defaultProps = {
  keyRotateLeft: DEFAULT_KEY_MAP.keyRotateLeft,
  keyRotateRight: DEFAULT_KEY_MAP.keyRotateRight,
  keyMoveDown: DEFAULT_KEY_MAP.keyMoveDown,
  keyMoveLeft: DEFAULT_KEY_MAP.keyMoveLeft,
  keyMoveRight: DEFAULT_KEY_MAP.keyMoveRight,
  keyDropPiece: DEFAULT_KEY_MAP.keyDropPiece,
  keyHoldPiece: DEFAULT_KEY_MAP.keyHoldPiece
}

export default ControlsMap;