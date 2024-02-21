import { Ref } from "preact";
import { forwardRef } from "preact/compat"
import imageSrc from "../assets/bg_cave18_hd.webp";
import overlaySrc from "../assets/radial_bg_blend.avif";

const WATER_SCALE:string = "3";

const Filters = forwardRef( function Filters(props: any, ref:Ref<SVGSVGElement>) {
  
  return (
    <>
    <svg ref={ref} id="BackgroundSVG2" xmlns="http://www.w3.org/2000/svg" version="1.1">
      <defs>
        <filter id="WaveFilterQuality">
        <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.01 0.04" seed="13" numOctaves="2" />
          <animate xlinkHref="#feTurb" attributeName="baseFrequency" 
          dur="20s" 
          keyTimes="0;1"
          values="
          0.01 0.08;
          0.02 0.04" 
          repeatCount="indefinite"/>
          <feDisplacementMap id="feDisp" in="SourceGraphic" scale="5" />
        </filter>

        <filter id="Water0">
        <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.01 0.08" seed="13" numOctaves="2" />
        <feDisplacementMap id="feDisp" in="SourceGraphic" scale={WATER_SCALE} /></filter>
        <filter id="Water05">
        <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.01125 0.075" seed="13" numOctaves="2" />
        <feDisplacementMap id="feDisp" in="SourceGraphic" scale={WATER_SCALE} /></filter>
        <filter id="Water1">
        <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.0125 0.07" seed="13" numOctaves="2" />
        <feDisplacementMap id="feDisp" in="SourceGraphic" scale={WATER_SCALE} /></filter>
        <filter id="Water15">
        <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.01375 0.065" seed="13" numOctaves="2" />
        <feDisplacementMap id="feDisp" in="SourceGraphic" scale={WATER_SCALE} /></filter>
        <filter id="Water2">
        <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.015 0.06" seed="13" numOctaves="2" />
        <feDisplacementMap id="feDisp" in="SourceGraphic" scale={WATER_SCALE} /></filter>
        <filter id="Water25">
        <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.01625 0.055" seed="13" numOctaves="2" />
        <feDisplacementMap id="feDisp" in="SourceGraphic" scale={WATER_SCALE} /></filter>
        <filter id="Water3">
        <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.0175 0.05" seed="13" numOctaves="2" />
        <feDisplacementMap id="feDisp" in="SourceGraphic" scale={WATER_SCALE} /></filter>
        <filter id="Water35">
        <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.01875 0.045" seed="13" numOctaves="2" />
        <feDisplacementMap id="feDisp" in="SourceGraphic" scale={WATER_SCALE} /></filter>
        <filter id="Water4">
        <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.02 0.04" seed="13" numOctaves="2" />
        <feDisplacementMap id="feDisp" in="SourceGraphic" scale={WATER_SCALE} /></filter>

        <filter id="WaveFilterQuality2">
          <feTurbulence id="feTurb2" type="fractalNoise" baseFrequency="0.02 0.06" seed="7" numOctaves="2" />
          <animate xlinkHref="#feTurb2" 
          attributeName="baseFrequency" 



          dur="20s" 
          keyTimes="0;1" 
          values="
          0.02 0.12;
          0.04 0.06" repeatCount="indefinite"/>
          <feDisplacementMap id="feDisp" in="SourceGraphic" scale="8" />
        </filter>
        <filter id="WaveFilter">
          <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.01 0.1" seed="13" numOctaves="2" result="turbBase"/>

          <feColorMatrix in="turbBase" in2="SourceGraphic" type="hueRotate" values="0" result="waves">
            <animate attributeName="values" from="0" to="360" dur="7s" repeatCount="indefinite"/>
          </feColorMatrix>

          <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.017 0.14" seed="5" numOctaves="2" result="turbBase2"/>
          <feColorMatrix in="turbBase2" in2="SourceGraphic" type="hueRotate" values="0" result="waves2">
            <animate attributeName="values" from="-180" to="180" dur="11s" repeatCount="indefinite"/>
          </feColorMatrix>
          <feDisplacementMap id="feDisp" in="waves" in2="waves2" scale="100" result="displacementMap"  xChannelSelector="R" yChannelSelector="B"/>
          <feComposite operator="in" in="displacementMap" in2="SourceGraphic" result="noiseMapMonochrome"/>
          <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
        </filter>
        <filter id="WaveFilter2">
          <feTurbulence id="feTurb" type="fractalNoise" baseFrequency="0.01 0.1" seed="7" numOctaves="2" result="turbBase"/>
          
          <feColorMatrix in="turbBase" in2="SourceGraphic" type="hueRotate" values="0" result="waves">
            <animate attributeName="values" from="0" to="360" dur="7s" repeatCount="indefinite"/>
          </feColorMatrix>

          <feTurbulence id="feTurb2" type="fractalNoise" baseFrequency="0.005 0.07" seed="19" numOctaves="2" result="turbBase2"/>
          <feColorMatrix in="turbBase2" in2="SourceGraphic" type="hueRotate" values="0" result="waves2">
            <animate attributeName="values" from="-180" to="180" dur="11s" repeatCount="indefinite"/>
          </feColorMatrix>
          <feDisplacementMap id="feDisp2" in="waves" in2="waves2" scale="100" result="displacementMap"  xChannelSelector="R" yChannelSelector="B"/>
          <feComposite operator="in" in="displacementMap" in2="SourceGraphic" result="noiseMapMonochrome"/>
          <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
          {/* <feBlend in="SourceGraphic" in2="displacementMap" mode="screen" /> */}
        </filter>
        
        <filter id="BgBlend">
          <radialGradient id="GradientOverlay">
            <stop stop-color="#311F" />
            <stop stop-color="#9999" />
            <stop stop-color="#44222299" />
            <stop stop-color="#334C" />
            <stop stop-color="#313C" />
          </radialGradient>
        <feColorMatrix 
        in="GradientOverlay" 
        in2="SourceGraphic"
        
          type="matrix" 
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.6 0" 
          result="overlay"/>
        {/* <feComposite in="GradientOverlay" in2="SourceGraphic" result="overlayComposite"/> */}
        <feBlend in="SourceGraphic" in2="GradientOverlay" mode="difference" />
        </filter>
      </defs>
      <g style={{filter: "url(#BgBlend)", transform: `translate(${props.tx ?? 0}px, ${props.ty ?? 0}px) scale(${props.scale ?? 1})`}}>
      <mask id="myMask" maskContentUnits="objectBoundingBox">
        <rect fill="white" x="0" y="0" width="100%" height="100%" />
        <polygon
          fill="black"
          points="0.0,0.0 
          1.0,0.0 
          1.0,0.643 
          0.66,0.5915 
          0.6,0.588  
          0.423,0.588 
          0.45,0.613 
          0.31,0.613 
          0.30,0.627 
          0.29,0.627 
          0.167,0.633 
          0.173,0.657 
          0.14,0.67 
          0.0,0.68
          " 
          />
      </mask>
      <mask id="myMask2" maskContentUnits="objectBoundingBox">
        <rect fill="white" x="0" y="0" width="100%" height="100%" />
        <polygon
          fill="black"
          points="0.0,0.0 
          1.0,0.0 
          1.0,0.7 
          0.6,0.65  
          0.45,0.65 
          0.29,0.675
          0.14,0.69
          0.0,0.7
          " 
          />
      </mask>
      radial-gradient(circle at center, #311F, #9999, #44222299, #334c, #313c);

      

      <image y="0" x="0" href={imageSrc} scale={props.scale} 
      // filter="url(#BgBlend)"
      ></image>
      <image className="animate-water" y="0" x="0" filter="url(#Water0)" mask="url(#myMask)" href={imageSrc} scale={props.scale} opacity={0.7}></image>
      {/* <image className="animate-water" y="0" x="0" filter="url(#Water0)" mask="url(#myMask2)" href={imageSrc} scale={props.scale}></image> */}
      </g>
  </svg>
    <svg id="SVG_Filters" xmlns="http://www.w3.org/2000/svg" version="1.1"  
    style="position: absolute; width: 0; height: 0; overflow: hidden;">
    <defs>
      <filter id="ghostly" x="-10%" y="-10%" width="120%" height="120%" filterUnits="objectBoundingBox" 
      primitiveUnits="userSpaceOnUse" 
      color-interpolation-filters="linearRGB">
        <feMorphology operator="dilate" radius="2 2" in="SourceAlpha" result="morphology"/>
        <feFlood flood-color="#313d48CC" flood-opacity="0.2" result="flood"/>
        <feComposite in="flood" in2="morphology" operator="in" result="composite"/>
        <feComposite in="composite" in2="SourceAlpha" operator="out" result="composite1"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.03 0.045" numOctaves="3" seed="2" stitchTiles="stitch" result="turbulence"/>
        <feDisplacementMap in="composite1" in2="turbulence" scale="10" xChannelSelector="A" yChannelSelector="A" result="displacementMap"/>
        <feMerge result="merge">
          <feMergeNode in="SourceGraphic"/>
          <feMergeNode in="displacementMap"/>
          </feMerge>
      </filter>
      <filter id="sandy0">
        <feTurbulence baseFrequency="0.6,0.4" numOctaves={2} seed="3" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.8 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
      <filter id="sandy1">
        <feTurbulence baseFrequency="1.75,1.65" numOctaves={2} seed="2" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.8 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
      <filter id="sandy2">
        <feTurbulence baseFrequency="1.73,1.83" numOctaves={2} seed="3" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.8 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
      <filter id="sandy3">
        <feTurbulence baseFrequency="1.75,1.65" numOctaves={2} seed="5" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.8 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
      <filter id="sandy4">
        <feTurbulence baseFrequency="1.63,1.33" numOctaves={2} seed="7" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.8 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
      <filter id="sandy5">
        <feTurbulence baseFrequency="1.35,1.65" numOctaves={2} seed="13" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.8 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
      <filter id="sandy6">
        <feTurbulence baseFrequency="1.4,1.9" numOctaves={2} seed="17" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.8 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
  
      <filter id="frosted-glass" width="110%" height="110%">
        {/* <!-- Increase the blur value to enhance the frosted glass effect --> */}
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blurred"/>
        {/* <!-- Apply a color matrix to adjust the blurriness and color if needed --> */}
        <feColorMatrix in="blurred" type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.8 0" result="color-adjust"/>
        
        {/* <!-- Optionally, blend the original graphic back in to vary the intensity of the effect --> */}
        <feComposite in="SourceGraphic" in2="color-adjust" operator="in" result="frosted"/>
      </filter>
      <filter id="frosted-glass-light" x="0" y="0" width="120%" height="120%">
        {/* <!-- Gaussian Blur for the frosted glass effect --> */}
        
        <feColorMatrix type="matrix" 
        values=".33 .33 .33 0 0
                .33 .33 .33 0 0
                .33 .33 .33 0 0
                  0   0   0 1 0" 
          in="SourceGraphic" 
          result="colormatrix"/>
  
        {/* <!-- <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blurred"/> --> */}
        {/* <!-- Specular lighting to simulate light coming from behind --> */}
        <feComposite in="SourceGraphic" in2="colormatrix" operator="in" result="composite1"/>
        
        <feSpecularLighting surfaceScale="1" specularConstant="1" specularExponent="10" lighting-color="#fcfeff" in="composite1" in2="SourceGraphic" result="specularLighting2">
          <fePointLight x="0" y="100" z="300"/>
        </feSpecularLighting>
  
          {/* <!-- Point light source behind the frosted glass --> */}
          {/* <!-- <fePointLight x="75" y="50" z="100"/> --> */}
        {/* <!-- </feSpecularLighting> --> */}
        <feBlend in="SourceGraphic" in2="specularLighting2" mode="screen" />
        
        {/* <!-- Composite the specular lighting with the blurred image --> */}
        {/* <!-- <feComposite in="specularLighting2" in2="blurred" operator="in" result="litFrosted"/> --> */}
        
        {/* <!-- Color matrix to adjust the final appearance, if needed --> */}
        {/* <!-- <feColorMatrix in="litFrosted" type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.8 0"/> --> */}
      </filter>
      
    </defs>
  </svg>
  </>
  );
  });

  export default Filters;
