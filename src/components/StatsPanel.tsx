import { MutableRef, useEffect, useRef } from "preact/hooks";
import { BaseComponentProps, LAYOUT_DESKTOP, LAYOUT_MOBILE } from "../BaseTypes";
import { Ref } from "preact";
import { forwardRef } from "preact/compat";
import { Scoring } from "./Game";
import { useStatsStore } from "../store/StatsStore";
import { useGameStore } from "../store/GameStore";

export const updateStatsByRef = (stats: Scoring, ref: HTMLDivElement) => {
  const scoreEl: HTMLHeadingElement | null = ref.querySelector("#Stats_Score .stats-field-value");
  if (scoreEl) {
    scoreEl.setAttribute("data-label", `${stats.score}`);
    scoreEl.innerText = `${stats.score}`;
  }

  const levelEl: HTMLHeadingElement | null = ref.querySelector("#Stats_Level .stats-field-value");
  if (levelEl) {
    levelEl.setAttribute("data-label", `${stats.level}`);
    levelEl.innerText = `${stats.level}`;
  }

  const linesEl: HTMLHeadingElement | null = ref.querySelector("#Stats_Lines .stats-field-value");
  if (linesEl) {
    linesEl.setAttribute("data-label", `${stats.lines}`);
    linesEl.innerText = `${stats.lines}`;
  }
}

export const StatsPanel = forwardRef(function StatsPanel(props: BaseComponentProps, ref: Ref<HTMLDivElement>) {

  return (
    <>
      <div ref={ ref } id={ props.id } data-layout={ props.layout } className={ "stats-panel" + (props.className || "") }>
        {/* { props.layout === LAYOUT_DESKTOP &&
          <div id="StatsPanelScaleWrapper" style={ { transform: `scale(${props.scale ?? 1})` } }>
            <StatsField id="Stats_Score" valueKey="score" label="Score" index={ 0 } layout={ props.layout } />
            <StatsField id="Stats_Lines" valueKey="lines" label="Lines" index={ 1 } layout={ props.layout } />
            <StatsField id="Stats_Level" valueKey="level" label="Level" index={ 2 } layout={ props.layout } />
            <StatsField id="Stats_Timer" valueKey="time" label="Time" index={ 3 } layout={ props.layout } />
          </div>
        } */}
        {/* { props.layout === LAYOUT_MOBILE && */ }
        { true &&
          <div id="StatsPanelScaleWrapper" style={ { transform: `scale(${props.scale ?? 1})` } }>
            <StatsField id="Stats_Timer" valueKey="time" label="Time" index={ 3 } layout={ props.layout } />
            <StatsField id="Stats_Level" valueKey="level" label="Level" index={ 2 } layout={ props.layout } />
            <StatsField id="Stats_Lines" valueKey="lines" label="Lines" index={ 1 } layout={ props.layout } />
            <StatsField id="Stats_Score" valueKey="score" label="Score" index={ 0 } layout={ props.layout } />
          </div>
        }
      </div>
    </>
  );
});

export default StatsPanel;

interface StatsFieldProps extends BaseComponentProps {
  valueKey: "lines" | "level" | "score" | "time";
  label: string;
  index?: number;
}

const StatsField = (props: StatsFieldProps) => {

  const [stats] = useStatsStore();
  const [gameState] = useGameStore();

  // const _props = useContext(AppContext).props;
  // const stats = _props.stats as any;
  const valueRef: MutableRef<HTMLHeadingElement | null> = useRef(null);
  const interval: Ref<NodeJS.Timeout> = useRef(null)
  // const [statValue, setStatValue] = useState(stats[props.valueKey])

  useEffect(() => {
    // setStatValue(stats[props.valueKey]);
    if (valueRef.current && props.valueKey !== "time") {
      valueRef.current.innerText = `${stats[props.valueKey]}`;
    }
  }, [(stats as any)[props.valueKey], gameState.timeGameStart]);

  useEffect(() => {
    if (props.valueKey === "time") {
      if (interval.current) {
        clearInterval(interval.current);
      }
      interval.current = setInterval(() => {
        if (valueRef.current && !gameState.gamePaused && !gameState.gameOver) {
          const elapsedTime = Date.now() - gameState.timeGameStart - gameState.timePausedTotal;
          const _hr = Math.floor(elapsedTime / 1000 / 3600);
          const _min = Math.floor((elapsedTime / 1000 - (_hr * 60)) / 60);
          const _sec = (100 + Math.round(elapsedTime / 1000 - (_min * 60))).toString().substring(1, 3);
          // const _tenths = (10 + Math.round(elapsedTime % 100)).toString().substring(1,2);
          const _timeFmt = props.layout === LAYOUT_DESKTOP
            ? `${_hr}:${(100 + _min).toString().substring(1, 3)}:${_sec}`
            : `${(_min + (60 * _hr)).toString()}:${_sec}`;
          // const _timeFmt = `<div style="display: inline-block; width: 0.45rem">${_hr}</div>:<div style="display: inline-block; width: 0.9rem">${(_min + 100).toString().substring(1,3)}</div>:<div style="display: inline-block; width: 0.9rem">${_sec}</div>:<div style="display: inline-block; width: 0.45rem">${_tenths}</div>`;
          // valueRef.current.innerHTML = _timeFmt;
          valueRef.current.innerText = _timeFmt;
          valueRef.current.setAttribute("data-label", _timeFmt);
        }
      }, 100);
      return () => {
        if (interval.current) {
          clearInterval(interval.current);
        }
      }
    }
  }, [gameState.gameReset, gameState.gameOver, gameState.gameWon, gameState.gamePaused])

  const value: string = props.valueKey === "time" ? "0:00.0" : `${stats[props.valueKey]}`;

  return (
    <div id={ props.id } className={ `${props.className} stats-field` }>
      <h3 className="stats-field-name" data-label={ props.label }>
        { props.label }
      </h3>
      <div className="stats-field-value-bg">
        { true &&
          <div className="tw-flex tw-items-center tw-justify-end"
            style={ {
              justifyContent: "flex-end",
              width: props.layout === LAYOUT_MOBILE && props.valueKey !== "time" ? `${5.3 - (props.index ?? 0) * 0.62}rem` : 'inherit'
            } }>
            <h3 ref={ valueRef } data-label={ value } className="stats-field-value">
              { value }
            </h3>
          </div>
        }
        {/* {props.layout === LAYOUT_DESKTOP &&
        <h3 ref={valueRef} data-label={value} className="stats-field-value">
          {value}
        </h3>
      } */}
      </div>
    </div>
  );
}
