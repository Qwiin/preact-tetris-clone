import { useEffect } from "preact/hooks";
import { BaseComponentProps } from "../BaseTypes";

interface ControlsMapProps extends BaseComponentProps {
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
  keyHoldPiece: 'Slash',
  layout:'desktop'
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

  useEffect(()=>{

    document.querySelectorAll('.game-control-button').forEach((el: Element) =>{
      el.addEventListener("mousedown", ()=>{buttonDownHandler(el)});
      el.addEventListener("mouseup", ()=>{buttonUpHandler(el)});
    });

    return () => {
      document.querySelectorAll('.game-control-button').forEach((el: Element) =>{
        el.removeEventListener("mousedown", ()=>{buttonDownHandler(el)});
        el.removeEventListener("mouseup", ()=>{buttonUpHandler(el)});
      });
    }
  },[]);

  function buttonDownHandler(el: Element){
    el.classList.add("clicked");
  }
  function buttonUpHandler(el: Element){
    el.classList.remove("clicked");
  }

  return (
    <>
      <div data-layout={props.layout} className="game-control-map tw-flex tw-gap-1 tw-flex-col tw-justify-center tw-items-center tw-rounded-lg tw-px-1">

        <div className="btn-row">
          <div id="BtnRotLeft" className="game-control-button hover-text btn-rot-l" 
          onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyRotateLeft})}}}
          >
            <>↺</>
            <span class="tooltip-text top tw-flex-none tw-p-0">{props.keyRotateLeft} ({props.keyRotateLeft ? KEY_CODE_MAP[props.keyRotateLeft] : props.keyRotateLeft})</span>
          </div>
          <div id="BtnHold" className=" game-control-button hover-text subtext btn-hold"
          onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyHoldPiece})}}}>
            <><p className="tw-mt-2" style={{paddingLeft: "0.2rem", paddingTop:"0.1rem",fontSize: '0.5rem', fontWeight: "bold", letterSpacing:"0.1rem", fontFamily: "Brick3DRegular"}}>HOLD</p></>
            {/* <span class="tooltip-text top tw-flex-none tw-p-0">{props.keyHoldPiece} ({props.keyHoldPiece ? KEY_CODE_MAP[props.keyHoldPiece] : props.keyHoldPiece?.toString()})</span> */}
            <span class="tooltip-text top tw-flex-none tw-p-0">Slash ({props?.keyHoldPiece && (KEY_CODE_MAP[props.keyHoldPiece] || props.keyHoldPiece)})</span>
          </div>
          {/* <div className="tw-bg-gray-900 tw-rounded-md tw-shadow-inner tw-shadow-slate-400 tw-w-8 tw-h-8 hover-text"><>{KEY_CODE_MAP[props.keyDropPiece]}</>
            <span class="tooltip-text top tw-flex-none tw-p-0">Drop Piece</span>
          </div> */}
          <div id="BtnRotRight" className="game-control-button hover-text btn-rot-r" 
          onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyRotateRight})}}}
          >
            <>↻</>
            <span class="tooltip-text top tw-flex-none tw-p-0">{props.keyRotateRight} ({props.keyRotateRight ? KEY_CODE_MAP[props.keyRotateRight] : props.keyRotateRight})</span>
          </div>
        </div>
        <div className="btn-row">
          <div id="BtnMoveLeft" className="game-control-button hover-text"
            onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyMoveLeft})}}}>
            <>{props?.keyMoveLeft && (KEY_CODE_MAP[props.keyMoveLeft] || props.keyMoveLeft)}</>
          <span class="tooltip-text bottom tw-flex-none tw-p-0">Move Left ({props?.keyMoveLeft && (KEY_CODE_MAP[props.keyMoveLeft] || props.keyMoveLeft)})</span>
          </div>
          <div className="btn-col">
            <div id="BtnDrop" className=" game-control-button hover-text subtext"
            style={{lineHeight:"1.25rem"}}
            onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyDropPiece})}}}>
              <>
                {props?.keyDropPiece && (KEY_CODE_MAP[props.keyDropPiece] || props.keyDropPiece)}
                <div className="tw-text-sm tw-text-s tw-p-0 tw-m-0" style={{paddingLeft: "0.2rem",marginTop: "-0.375rem",fontSize: '0.5rem', fontWeight: "bold", letterSpacing:"0.1rem", fontFamily: "Brick3DRegular"}}>DROP</div>
              </>
              <span class="tooltip-text top tw-flex-none tw-p-0">Drop Piece ({props?.keyDropPiece && (KEY_CODE_MAP[props.keyDropPiece] || props.keyDropPiece)})</span>
            </div>
            <div id="BtnMoveDown" className="game-control-button hover-text"
              onClick={()=>{ if(props.clickCallback) { props.clickCallback({key: props?.keyMoveDown})}}}>
              <>{props?.keyMoveDown && (KEY_CODE_MAP[props.keyMoveDown] || props.keyMoveDown)}</>
              <span class="tooltip-text bottom tw-flex-none tw-p-0">Move Down ({props?.keyMoveDown && (KEY_CODE_MAP[props.keyMoveDown] || props.keyMoveDown)})</span>
            </div>
          </div>
          <div id="BtnMoveRight" className="game-control-button hover-text"
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