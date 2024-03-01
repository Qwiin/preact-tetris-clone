import { MutableRef, useContext, useEffect, useRef, useState } from "preact/hooks";
import { BaseComponentProps, LAYOUT_DESKTOP, LAYOUT_MOBILE } from "../BaseTypes";
import { AppContext } from "../AppProvider";
import { Ref } from "preact";
import { forwardRef } from "preact/compat";
import { Scoring } from "./Game";

export const updateStatsByRef = (stats: Scoring, ref: HTMLDivElement) => {
  const scoreEl: HTMLHeadingElement | null = ref.querySelector("#Stats_Score .stats-field-value");
  if(scoreEl) {
    scoreEl.innerText = `${stats.score}`;
  }

  const levelEl: HTMLHeadingElement | null = ref.querySelector("#Stats_Level .stats-field-value");
  if(levelEl) {
    levelEl.innerText = `${stats.level}`;
  }

  const linesEl: HTMLHeadingElement | null = ref.querySelector("#Stats_Lines .stats-field-value");
  if(linesEl) {
    linesEl.innerText = `${stats.lines}`;
  }
}

export const StatsPanel = forwardRef( function StatsPanel(props: BaseComponentProps, ref: Ref<HTMLDivElement>) {

  return (
    <>
      <div ref={ref} id="StatsPanel" data-layout={props.layout} className={"stats-panel" + (props.className || "")}>
        <div id="StatsPanelScaleWrapper" style={{transform: `scale(${props.scale ?? 1})`}}>
          <StatsField id="Stats_Score" valueKey="score" label="Score" index={0} layout={props.layout}/>
          <StatsField id="Stats_Lines" valueKey="lines" label="Lines" index={1} layout={props.layout}/>
          <StatsField id="Stats_Level" valueKey="level" label="Level" index={2} layout={props.layout}/>
          <StatsField id="Stats_Timer" valueKey="time" label="Time" index={3} layout={props.layout}/>
        </div>
      </div>
    </>
  );
});

export default StatsPanel;

interface StatsFieldProps extends BaseComponentProps {
  id?: string;
  valueKey: "lines" | "level" | "score" | "time";
  label: string;
  index?: number;
}

const StatsField = (props: StatsFieldProps) => {

  const _props = useContext(AppContext).props;
  const stats = _props.stats as any;
  const valueRef: MutableRef<HTMLHeadingElement | null> = useRef(null);
  const interval: Ref<NodeJS.Timeout> = useRef(null)
  // const [statValue, setStatValue] = useState(stats[props.valueKey])

  useEffect(()=>{
    // setStatValue(stats[props.valueKey]);
    if(valueRef.current) {
      valueRef.current.innerText = `${stats[props.valueKey]}`;
    }
  },[stats[props.valueKey]]);

  useEffect(()=>{
    if(props.valueKey === "time") {
      if(interval.current) {
        clearInterval(interval.current);
      }
      interval.current = setInterval(()=>{
        if(valueRef.current && !_props.gamePaused && !_props.gameOver) {
          const elapsedTime = Date.now() - _props.timeStart - _props.timePausedTotal;
          const _min = Math.floor(elapsedTime / 1000 / 60);
          const _sec = (100 + Math.round(elapsedTime / 1000 - (_min * 60))).toString().substring(1,3);
          const _tenths = (10 + Math.round(elapsedTime % 100)).toString().substring(1,2);
          valueRef.current.innerText = `${_min + ":" + _sec + "." + _tenths}`;
        }
      },50);
      return () => {
        if(interval.current) {
          clearInterval(interval.current);
        }
      }
    }
  },[_props.gameReset, _props.gameOver, _props.gamePaused])

  return (
    <div id={props.id} className={`${props.className} stats-field`}>
      <h3 className="stats-field-name">
        {props.label}
      </h3>
      <div className="stats-field-value-bg">
      {props.layout === LAYOUT_MOBILE &&
        <div className="tw-flex tw-items-center tw-justify-end"
        style={{justifyContent: "flex-end",
          width: `${4.3 - (props.index ?? 0)*0.62}rem`}}>
        <h3 ref={valueRef} className="stats-field-value">
          {props.valueKey === "time" ? "0:00.0" : stats[props.valueKey]}
        </h3>
        </div>
      }
      {props.layout === LAYOUT_DESKTOP &&
        <h3 ref={valueRef} className="stats-field-value">
          {props.valueKey === "time" ? "0:00.0" : stats[props.valueKey]}
        </h3>
      }
      </div>
    </div>
  );
}