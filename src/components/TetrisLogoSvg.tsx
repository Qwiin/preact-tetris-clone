// import { CSSColors } from "../BaseTypes";

interface Props {
  strokeColor: string;
  strokeWidth: number | string;
  strokeLinejoin: "round" | "inherit" | "miter" | "bevel";
  strokeLinecap: "round" | "inherit" | "butt" | "square";
  fillColor: string;
  fillOpacity: number | undefined;
  height: number | string;
  width?: number | string;
  letterFilter?: string | string[];
  id: string;
}

const X_PAD: number = 48;
const Y_PAD: number = 16;
const GLOW_COLOR: string = "#4169E199";

export const TetrisLogoSvg = (props:Props) => {

  const getWidth = () => {

    if(props.width !== undefined) {
      return props.width;
    }

    if(typeof props.height === "string") {
      const floatHeight = parseFloat(props.height);
      const units = props.height.substring(props.height.search(/[A-Za-z%]/));
      return (floatHeight * 2.4) + units;
    }

    return props.height * 2.4;
  }

  const getHeight = () => {

    if(props.height !== undefined) {
      return props.height;
    }

    if(typeof props.width === "string") {
      const floatWidth = parseFloat(props.width);
      const units = props.width.substring(props.width.search(/[A-Za-z%]/));
      return (floatWidth / 2.4) + units;
    }

    return props.height / 2.4;
  }

  const getLetterFilter = (index: number) => {
    if(props.letterFilter === undefined){
      return undefined;
    }
    if(typeof props.letterFilter === "string") {
      return props.letterFilter;
    }
    if(Array.isArray(props.letterFilter)) {
      return props.letterFilter[index];
    }
  }



  return (
    <svg id={props.id} xmlns="http://www.w3.org/2000/svg" 
      width={getWidth()} 
      height={getHeight()}
      viewBox={`${-X_PAD} ${-Y_PAD} ${240 + X_PAD} ${100+X_PAD}`}
      
      // style={{border: "1px solid green"}}
      >

      <defs>

    
        <linearGradient id="fadeGrad" y2="1" x2="0" 
        gradientTransform="rotate(-8.5)"
        >
          {/* <stop offset="0" stop-color="white" stop-opacity="1"/> */}
          <stop offset="0.65" stop-color="white" stop-opacity="1"/>
          <stop offset="0.8" stop-color="white" stop-opacity="0"/>
        </linearGradient>

        <mask id="fadeMask" maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill="url(#fadeGrad)"/>
        </mask>
  

        <radialGradient
          id="TitleGradient"
          spreadMethod="pad"
          
          >
          <stop offset="0%" stopColor={GLOW_COLOR} stopOpacity={0.9}/>
          <stop offset="33%" stopColor={GLOW_COLOR} stopOpacity={0.45}/>
          <stop offset="66%" stopColor={GLOW_COLOR} stopOpacity={0.15}/>
          <stop offset="100%" stopColor={GLOW_COLOR} stopOpacity={0}/>
        </radialGradient>

      </defs>

      <g id="word0" filter="url(#shadow3)">
        <ellipse fill={'url(#TitleGradient)'} filter="url(#shadow2)" opacity={0.5}
          cx={`${50 - X_PAD * 100 / (240+X_PAD)}%`} 
          cy={`${(52 - Y_PAD * 100 / (100+Y_PAD))*0.96}%`} 
          rx={`${50 + (X_PAD/2/2.4)}%`}
          ry={`${(40 + (Y_PAD/2/100))*1.1}%`} >
          
        </ellipse>
      </g>
      
      <g id="lettersWrapper" transform={`translate(${-X_PAD/2} ${Y_PAD})`} style={{padding: "0.1rem"}} mask={"url(#fadeGrad)"}>
        
        <g id="letter0" filter={getLetterFilter(0)}>
          <path d={`
              M 10, 10
              L 40, 10
              L 40, 20
              L 30, 20
              L 30, 30
              L 20, 30
              L 20, 20
              L 10, 20
              L 10, 10`}
            stroke={props.strokeColor}
            fill={props.fillColor}
            strokeWidth={props.strokeWidth}
            strokeLinecap={props.strokeLinecap}
            strokeLinejoin={props.strokeLinejoin}
            fillOpacity={props.fillOpacity}
          />
          <path d={`
              M 20, 30
              L 30, 30
              L 30, 70
              L 20, 70
              L 20, 30
              `}
            stroke={props.strokeColor}
            fill={`${props.fillColor}`}
            strokeWidth={props.strokeWidth}
            strokeLinecap={props.strokeLinecap}
            strokeLinejoin={props.strokeLinejoin}
            fillOpacity={props.fillOpacity}
          />
        </g>

        <g id="letter1" filter={getLetterFilter(1)}>
          <path d={`
              M 50, 10
              L 90, 10
              L 90, 20
              L 50, 20
              L 50, 10
              `}
            stroke={props.strokeColor}

            fill={props.fillColor}
            strokeWidth={props.strokeWidth}
            strokeLinecap={props.strokeLinecap}
            strokeLinejoin={props.strokeLinejoin}
            fillOpacity={props.fillOpacity}
          />

          <path d={`
              M 60, 20
              L 70, 20
              L 70, 30
              L 90, 30
              L 90, 40
              L 60, 40
              L 60, 20
              `}
            stroke={props.strokeColor}

            fill={props.fillColor}
            strokeWidth={props.strokeWidth}
            strokeLinecap={props.strokeLinecap}
            strokeLinejoin={props.strokeLinejoin}
            fillOpacity={props.fillOpacity}
          />
        <path d={`
            M 60, 40
            L 70, 40
            L 70, 50
            L 90, 50
            L 90, 60
            L 60, 60
            L 60, 40
            `}
            stroke={props.strokeColor}
          fill={props.fillColor}
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          fillOpacity={props.fillOpacity}
        />
        </g>
        <g id="letter2" filter={getLetterFilter(2)}>
        <path d={`
            M 100, 10
            L 130, 10
            L 130, 20
            L 120, 20
            L 120, 30
            L 110, 30
            L 110, 20
            L 100, 20
            L 100, 10`}
            stroke={props.strokeColor}

          fill={props.fillColor}
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          fillOpacity={props.fillOpacity}
        />
        <path d={`
            M 110, 30
            L 120, 30
            L 120, 70
            L 110, 70
            L 110, 30
            `}
            stroke={props.strokeColor}

          fill={props.fillColor}
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          fillOpacity={props.fillOpacity}
        />
        </g>
        <g id="letter3" filter={getLetterFilter(3)}>

        <path d={`
            M 140, 10
            L 170, 10
            L 170, 30
            L 160, 30
            L 160, 20
            L 140, 20
            L 140, 10
            `}
            stroke={props.strokeColor}

          fill={props.fillColor}
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          fillOpacity={props.fillOpacity}
        />

        <path d={`
            M 140, 20
            L 150, 20
            L 150, 60
            L 140, 60
            L 140, 20
            `}
            stroke={props.strokeColor}

          fill={props.fillColor}
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          fillOpacity={props.fillOpacity}
        />

        <path d={`
            M 150, 30
            L 160, 30
            L 160, 40
            L 170, 40
            L 170, 60
            L 160, 60
            L 160, 50
            L 150, 50
            L 150, 30
            `}
            stroke={props.strokeColor}

          fill={props.fillColor}
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          fillOpacity={props.fillOpacity}
        />
        </g>
        <g id="letter4" mask="url(#fadeMask)">
        <rect transform={`translate(${-X_PAD/2} ${Y_PAD})`} y="-10%" x="69.3%" width="7%" height="75%" fill="transparent"></rect>
        <path filter={getLetterFilter(4)} d={`
            M 180, 10
            L 190, 10
            L 190, 50
            L 180, 50
            L 180, 10
            `}
            stroke={props.strokeColor}

          fill={props.fillColor}
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          fillOpacity={props.fillOpacity}
        />
        <path filter={getLetterFilter(4)} d={`
            M 180, 50
            L 190, 50
            L 190, 90
            L 180, 90
            L 180, 50
            `}
            stroke={props.strokeColor}

          fill={props.fillColor}
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          fillOpacity={props.fillOpacity}
          
        />
        </g>
        <g id="letter5" filter={getLetterFilter(5)}>
        <path d={`
            M 200, 10
            L 230, 10
            L 230, 20
            L 210, 20
            L 210, 30
            L 200, 30
            L 200, 10
            `}
            stroke={props.strokeColor}

          fill={props.fillColor}
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          fillOpacity={props.fillOpacity}
        />
        <path d={`
            M 200, 30
            L 230, 30
            L 230, 50
            L 220, 50
            L 220, 40
            L 200, 40
            L 200, 30
            `}
            stroke={props.strokeColor}

          fill={props.fillColor}
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          fillOpacity={props.fillOpacity}
        />
        <path d={`
            M 200, 60
            L 230, 60
            L 230, 50
            L 220, 50
            L 220, 40
            L 210, 40
            L 210, 50
            L 200, 50
            L 200, 60`}
            stroke={props.strokeColor}

          fill={props.fillColor}
          strokeWidth={props.strokeWidth}
          strokeLinecap={props.strokeLinecap}
          strokeLinejoin={props.strokeLinejoin}
          fillOpacity={props.fillOpacity}
        />
        </g>
      </g>

    </svg>

  );
}