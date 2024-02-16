export function Filters() {
  return (
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
        <feTurbulence baseFrequency="0.65,0.75" numOctaves={2} seed="3" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.8 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
      <filter id="sandy180">
        <feTurbulence baseFrequency="0.75,0.65" numOctaves={2} seed="3" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.8 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
      <filter id="sandy270">
        <feTurbulence baseFrequency="0.73,0.83" numOctaves={2} seed="2" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.8 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
  
      <filter id="sandy2">
        <feTurbulence baseFrequency="0.6,0.8" seed="2" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0.8 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
      <filter id="sandy3">
        <feTurbulence baseFrequency="0.6,0.8" seed="2" result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/>
        <feComposite operator="in" in2="SourceGraphic" result="noiseMapMonochrome"/>
        <feBlend in="SourceGraphic" in2="noiseMapMonochrome" mode="multiply" />
      </filter>
      <filter id="sandy1">
        <feTurbulence baseFrequency="0.8,0.8"  result="noiseMapColor" />
        <feColorMatrix in="noiseMapColor" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/>
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
        
        <feColorMatrix type="matrix" values=".33 .33 .33 0 0
          .33 .33 .33 0 0
          .33 .33 .33 0 0
          0 0 0 1 0" in="SourceGraphic" result="colormatrix"/>
  
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
  );
  };