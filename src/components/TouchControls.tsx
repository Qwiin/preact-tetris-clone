import { useContext, useLayoutEffect, useRef } from "preact/hooks";
import { AppContext } from "../AppProvider";
import { Ref } from "preact";
import { BTN_DELAY_UNTIL_REPEAT, BTN_REPEAT_RATE } from "./ControlsMap";
import { swapCssClass } from "../utils/AppUtil";
import { CSSColors } from "../BaseTypes";

export type Vec2D = [number, number];

export const TouchControls = (props: { parentScale: number }) => {
  const wrapperRef: Ref<HTMLDivElement> = useRef(null);
  const ref: Ref<SVGSVGElement> = useRef(null);
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

  const appContext = useContext(AppContext);
  useLayoutEffect(() => {
    if (appContext.props.gamePaused) {
      if (wrapperRef.current) {
        wrapperRef.current.style.visibility = "hidden";
      }
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> Hiding Analog Stick UI");
    }
    else {
      if (wrapperRef.current) {
        wrapperRef.current.style.visibility = "visible";
      }
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> Showing Analog Stick UI");
    }
  }, [appContext.props.gamePaused]);

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
    repeatSpeed.current = speed;
    endBtnRepeat();
    if (!touchInterval.current) {
      if (!firstInputTriggered.current) {
        firstInputTriggered.current = true;
        document.dispatchEvent(new KeyboardEvent("keydown", { key: btnValue }));

      }
      touchIntervalDelay.current = setTimeout(() => {
        touchInterval.current = setInterval(() => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: btnValue }));
        }, BTN_REPEAT_RATE / (repeatSpeed.current || 1));
      }, BTN_DELAY_UNTIL_REPEAT / 3); // delay until repeat;
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
    <>
      <div ref={ wrapperRef } id="ControlStickRegion"
        onTouchStart={ (e: TouchEvent) => {

          if (!wrapperRef.current) { return }

          const parentBounds = wrapperRef.current.getBoundingClientRect();

          // parentBounds.width = 

          const stickEl = stickRef.current;
          const thisEl = ref.current;
          if (!stickEl || !thisEl) { return; }

          touchRef.current = e.touches[0].identifier;

          const bounds = thisEl.getBoundingClientRect();
          radius.current = (bounds.height + bounds.width) / 4;

          touchOrigin.current = [e.touches[0].clientX, e.touches[0].clientY];

          thisEl.style.left = `${(touchOrigin.current[0] - parentBounds.x - bounds.width / 2) * props.parentScale}px`;
          thisEl.style.top = `${(touchOrigin.current[1] - parentBounds.y - bounds.height / 2) * props.parentScale}px`;

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
              e.touches[0].clientX - touchOrigin.current[0],
              e.touches[0].clientY - touchOrigin.current[1]
            ];

            const vecLen: number = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2));
            const normalFactor = Math.max(vecLen, radius.current);
            const unitVec: Vec2D = [vec[0] / normalFactor, vec[1] / normalFactor];
            stickPos.current = unitVec;

            const unitLen = Math.sqrt(Math.pow(unitVec[0], 2) + Math.pow(unitVec[1], 2));

            if (unitLen > 0.25) {

              const xMag = Math.abs(unitVec[0]);
              const yMag = Math.abs(unitVec[1]);

              console.log({ xMag, yMag });

              if (xMag > yMag * 0.9) {
                console.log("LR");
                const repeatSpeed = xMag < 0.6 ? 1 : xMag < 0.8 ? 2 : 3;
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
                firstInputTriggered.current = true;
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


            stickRef.current.style.transform = `translate(${unitVec[0]}px,${unitVec[1]}px)`

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
        <svg ref={ ref } style={ {
          position: "absolute",
          bottom: 0,
          left: `calc(50% - 100px)`,
          // opacity: 0.2
        } } height="250" width="250" xmlns="http://www.w3.org/2000/svg" viewBox={ "-1.5 -1.5 3 3" }>
          <g radius={ 0.5 }>
            <circle id="StickPerimeter" cx="0" cy="0" r={ props.parentScale } opacity={ 0.7 } stroke={ CSSColors.WhiteSmoke } strokeWidth={ 0.02 }>
            </circle>
            <circle ref={ stickRef } id="StickThumb" style={ { pointerEvents: "none" } } className={ "control-stick" } cx="0" cy="0" r={ 0.3 * props.parentScale } fill={ CSSColors.WhiteSmoke } opacity={ 0.7 }>
              {/* <animate attributeName={ cx } attributeType={ "number" }></animate> */ }
            </circle>
          </g>
        </svg>
      </div>
      <div id="ButtonContols">
        <div id="HoldSwap" className="touch-button"
          data-char="Z"
          onClick={ () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "/" })); } }
        >Z</div>
        <div id="RotateL" className="touch-button"
          data-char="A"
          onClick={ () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift" })); } }
        >A</div>
        <div id="RotateR" className="touch-button"
          data-char="B"
          onClick={ () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Alt" })); } }
        >B</div>
      </div>
    </>
  )
}
