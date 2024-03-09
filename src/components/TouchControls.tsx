import { useContext, useEffect, useRef } from "preact/hooks";
import { AppContext } from "../AppProvider";
import { Ref } from "preact";
import { BTN_DELAY_UNTIL_REPEAT, BTN_REPEAT_RATE } from "./ControlsMap";
import { swapCssClass } from "../utils/AppUtil";
import { CSSColors } from "../BaseTypes";

export type Vec2D = [number, number];

export const TouchControls = (props: { parentScale: number }) => {

  const appContext = useContext(AppContext);
  // const [newTouchEnabled, setNewTouchEnabled] = useState(appContext.props.isNewTouchEnabled);

  const ref: Ref<HTMLDivElement> = useRef(null);
  const controlStickRegionRef: Ref<HTMLDivElement> = useRef(null);
  const svgRef: Ref<SVGSVGElement> = useRef(null);
  const stickRef: Ref<SVGCircleElement> = useRef(null);
  const stickPos: Ref<Vec2D> = useRef(null);
  const radius: Ref<number> = useRef(null);

  const touchOrigin: Ref<[number, number]> = useRef(null);
  const touchRef: Ref<number> = useRef(null);

  const touchInterval: Ref<NodeJS.Timeout> = useRef(null);
  const touchIntervalDelay: Ref<NodeJS.Timeout> = useRef(null);
  const firstInputTriggered: Ref<boolean> = useRef(false);
  const disableRepeatUntilNextTouch: Ref<boolean> = useRef(false);

  const repeatSpeed: Ref<number> = useRef(0);

  useEffect(() => {
    // setNewTouchEnabled(appContext.props.isNewTouchEnabled);
    if (ref.current) {
      if (appContext.props.isNewTouchEnabled) {
        ref.current.style.display = "block";
      }
      else {
        ref.current.style.display = "none";
      }
    }
  }, [appContext.props.isNewTouchEnabled]);

  useEffect(() => {

    if (appContext.props.gamePaused || appContext.props.gameOver) {
      // if (ref.current) {
      //   ref.current.style.display = "none";
      // }
      if (controlStickRegionRef.current) {
        controlStickRegionRef.current.style.visibility = "hidden";
      }
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> Hiding Analog Stick UI");
    }
    else {
      // if (ref.current) {
      //   ref.current.style.display = "block";
      // }
      if (controlStickRegionRef.current) {
        controlStickRegionRef.current.style.visibility = "visible";
      }
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> Showing Analog Stick UI");
    }
  }, [appContext.props.gamePaused, appContext.props.gameOver, appContext.props.isNewTouchEnabled]);

  const startBtnRepeat = (btnValue: string | undefined, speed: number = 0) => {
    if (disableRepeatUntilNextTouch.current === true) {
      return;
    }
    if (btnValue === undefined) {
      return;
    }
    if (speed === repeatSpeed.current) {
      return;
    }
    endBtnRepeat();
    repeatSpeed.current = speed;
    if (!touchInterval.current) {
      if (!firstInputTriggered.current) {
        firstInputTriggered.current = true;
        document.dispatchEvent(new KeyboardEvent("keydown", { key: btnValue }));

      }
      const repeatInterval = BTN_REPEAT_RATE * 3 / (repeatSpeed.current || 1);
      console.log(repeatInterval);
      touchIntervalDelay.current = setTimeout(() => {
        touchInterval.current = setInterval(() => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: btnValue }));
        }, repeatInterval);
      }, BTN_DELAY_UNTIL_REPEAT / 2); // delay until repeat;
    }
  }

  const endBtnRepeat = () => {
    repeatSpeed.current = 0;
    if (touchIntervalDelay.current) {
      clearTimeout(touchIntervalDelay.current);
      touchIntervalDelay.current = null;
    }
    if (touchInterval.current) {
      clearInterval(touchInterval.current);
      touchInterval.current = null;
    }
  }

  return (
    <div id="TouchControls" ref={ ref } style={ {
      display: appContext.props.isNewTouchEnabled ? 'block' : 'none',
      zIndex: !appContext.props.gameOver && !appContext.props.gamePaused ? 10000 : 0
    } }>
      <div ref={ controlStickRegionRef } id="ControlStickRegion"

        onClick={ () => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift" }));
        } }
        onTouchStart={ (e: TouchEvent) => {

          if (!controlStickRegionRef.current) { return }

          const parentBounds = controlStickRegionRef.current.getBoundingClientRect();

          // parentBounds.width = 

          const stickEl = stickRef.current;
          const thisEl = svgRef.current;
          if (!stickEl || !thisEl) { return; }

          touchRef.current = e.touches[0].identifier;

          const bounds = thisEl.getBoundingClientRect();
          radius.current = (bounds.height + bounds.width) / 4;

          touchOrigin.current = [e.touches[0].clientX, e.touches[0].clientY];

          thisEl.style.left = `${(touchOrigin.current[0] - parentBounds.x - bounds.width / 2) * props.parentScale}px`;
          thisEl.style.top = `${(touchOrigin.current[1] - parentBounds.y - bounds.height / 2) * props.parentScale}px`;

          // (7.92578125 - -577 - 450 / 2) * 0.711584597243118

          console.log('(', touchOrigin.current[0], "-", parentBounds.x, "-", bounds.width, "/ 2) *", props.parentScale);
          // console.log(`left: ${(touchOrigin.current[0] - parentBounds.x - bounds.width / 2) * props.parentScale}px`, `top: ${(touchOrigin.current[1] - parentBounds.y - bounds.height / 2) * props.parentScale}px`);

          thisEl.style.visibility = "visible";

          swapCssClass(stickEl, "off", "on");
          swapCssClass(thisEl, "off", "on");

          const touchX = e.targetTouches.item(0)?.clientX;
          const touchY = e.targetTouches.item(0)?.clientY;

          console.log({ touchX, touchY });

          window.ontouchmove = (e: TouchEvent) => {
            if (touchRef.current === null || !touchOrigin.current || radius.current === null || !stickRef.current) {
              console.error('touchMove abort: `!touchRef.current || !touchOrigin.current || !radius.current` is falsy')
              return;
            }

            const vec: Vec2D = [
              (e.touches[0].clientX - touchOrigin.current[0]) / props.parentScale / props.parentScale,
              (e.touches[0].clientY - touchOrigin.current[1]) / props.parentScale / props.parentScale
            ];

            const vecLen: number = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2));
            const normalFactor = Math.max(vecLen, radius.current);
            const unitVec: Vec2D = [vec[0] / normalFactor, vec[1] / normalFactor];
            stickPos.current = unitVec;

            const unitLen = Math.sqrt(Math.pow(unitVec[0], 2) + Math.pow(unitVec[1], 2));

            console.log(unitLen);
            if (unitLen > 0.25) {

              const xMag = Math.abs(unitVec[0]);
              const yMag = Math.abs(unitVec[1]);

              console.log({ xMag, yMag });

              if (xMag > yMag * 0.9) {
                console.log("LR");
                const repeatSpeed = unitLen < 0.4 ? 0.2 : unitLen < 0.6 ? 0.6 : unitLen < 0.8 ? 1.2 : 3.0;
                if (unitVec[0] > 0) {
                  startBtnRepeat("ArrowRight", repeatSpeed);
                }
                else {
                  startBtnRepeat("ArrowLeft", repeatSpeed);
                }
              }
              else if (unitVec[1] > 0) {
                console.log("DOWN");
                const repeatSpeed = yMag < 0.6 ? 1 : yMag < 0.8 ? 2 : 3;
                startBtnRepeat("ArrowDown", repeatSpeed);
              }
              else if (unitVec[1] < -0.5 && yMag / xMag > 1) {
                console.log("UP");
                endBtnRepeat();
                // firstInputTriggered.current = true;
                if (disableRepeatUntilNextTouch.current !== true) {
                  disableRepeatUntilNextTouch.current = true;
                  document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
                }
              }
              else {
                endBtnRepeat();
              }
            }
            // console.log(unitVec[0] * radius.current, unitVec[1] * radius.current);
            // console.log(`translate(${unitVec[0] * radius.current}px,${unitVec[1] * radius.current}px)`);


            stickRef.current.style.transform = `translate(${unitVec[0] * props.parentScale}px,${unitVec[1] * props.parentScale}px)`

          }
          window.ontouchend = () => {
            disableRepeatUntilNextTouch.current = false;
            firstInputTriggered.current = false;
            stickEl.animate([
              { transform: stickEl.style.transform },
              { transform: `translate(0px,0px)` },
            ],
              {
                duration: 200,
                easing: "ease-out"
              })
              .onfinish = () => {
                thisEl.style.visibility = "hidden";
                stickEl.style.transform = ""
              };

            endBtnRepeat();
            swapCssClass(thisEl, "on", "off");
            swapCssClass(stickEl, "on", "off");
            window.ontouchmove = null;
            window.ontouchend = null;
          }

        } }>
        <svg ref={ svgRef } style={ {
          position: "absolute",
          top: 0,
          left: `calc(50% - 150px)`,
          // opacity: 0.2
        } } height="300" width="300" xmlns="http://www.w3.org/2000/svg" viewBox={ "-1.5 -1.5 3 3" }>
          <g radius={ 0.5 }>
            <circle id="StickPerimeter" cx="0" cy="0" r={ props.parentScale } opacity={ 0.7 } stroke={ CSSColors.WhiteSmoke } strokeWidth={ 0.02 }>
            </circle>
            <circle ref={ stickRef } id="StickThumb" style={ { pointerEvents: "none" } } className={ "control-stick" } cx="0" cy="0" r={ 0.33 * props.parentScale } fill={ CSSColors.WhiteSmoke } opacity={ 0.7 }>
              {/* <animate attributeName={ cx } attributeType={ "number" }></animate> */ }
            </circle>
          </g>
        </svg>
      </div>
      <div id="ButtonControls" data-scale={ props.parentScale }>
        <div id="HoldSwap" className="touch-button"
          data-char="Z"
          onTouchStart={ (e: TouchEvent) => { (e.target as HTMLDivElement).classList.add("active"); document.dispatchEvent(new KeyboardEvent("keydown", { key: "/" })); } }
          onTouchEnd={ (e: TouchEvent) => { (e.target as HTMLDivElement).classList.remove("active"); } }
        ></div>
        <div id="RotateR" className="touch-button"
          data-char="A"
          onTouchStart={ (e: TouchEvent) => { (e.target as HTMLDivElement).classList.add("active"); document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift" })); } }
          onTouchEnd={ (e: TouchEvent) => { (e.target as HTMLDivElement).classList.remove("active"); } }
        ></div>
        <div id="RotateL" className="touch-button"
          data-char="B"
          onTouchStart={ (e: TouchEvent) => { (e.target as HTMLDivElement).classList.add("active"); document.dispatchEvent(new KeyboardEvent("keydown", { key: "Alt" })); } }
          onTouchEnd={ (e: TouchEvent) => { (e.target as HTMLDivElement).classList.remove("active"); } }
        ></div>
      </div>
    </div>
  )
}
