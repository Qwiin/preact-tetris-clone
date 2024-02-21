import { Ref } from "preact";
import { useRef } from "preact/compat";
import { BaseComponentProps } from "../BaseTypes";

interface Props extends BaseComponentProps {
  id: string;
  min: number;
  max: number;
  value: number;
  debounce?: boolean;
  onChange: (value: number) => void;
}

export function Slider(props: Props){

  const thumbRef: Ref<HTMLDivElement> = useRef(null);
  // const [value, setValue] = useState(props.value);
  const dragStarted = useRef(false);
  const callbackDebounce: Ref<NodeJS.Timeout> = useRef(null);

  const el: Ref<HTMLDivElement> = useRef(null);


  const mouseDownHandler = () => {
    dragStarted.current = true; 
    window.addEventListener("mousemove", dragHandler);
    
    const mouseUpHandler = ()=>{
      dragStarted.current = false;
      window.removeEventListener("mouseup", mouseUpHandler);
      window.removeEventListener("mousemove", dragHandler);
    };
    window.addEventListener("mouseup", mouseUpHandler);
  }

  const dragHandler = (e: MouseEvent) => {
    console.log(e);
    
    if(!dragStarted.current) {
      return;
    }
    
    if(!thumbRef.current){
      return;
    }

    let currentValue: number = parseInt(thumbRef.current.style.left);
    let newValue: number = Math.max( 0, Math.min( 100, currentValue + e.movementX));

    el.current?.setAttribute("data-value",newValue.toString());
    thumbRef.current.style.left = `${newValue}%`;

    if(props.onChange !== undefined) {
      if(props.debounce) {
        if(callbackDebounce.current) {
          clearTimeout(callbackDebounce.current);
        }
        callbackDebounce.current = setTimeout(()=>{
          props.onChange(newValue);  
        },500);
      }
      else {
        props.onChange(newValue);
      }
    }
  }

  return (
    <div ref={el}
      id={props.id} 
      data-layout={props.layout} 
      data-platform={props.platform}
      data-value={props.value}
      className={`${props.className} slider-container`}
    >
        <div class="slider-range-label">{props.min}</div>
        <div className="slider-track">
          <div className="slider-thumb"
          ref={thumbRef}
          style={{left: `${props.value}%`}}
          onDragStart={dragHandler}
          onMouseDown={mouseDownHandler}
          ></div>
        </div>
        <div class="slider-range-label">{props.max}</div>
    </div>
  );
}

export default Slider;