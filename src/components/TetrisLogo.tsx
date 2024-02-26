export const TetrisLogo = (props: any) => {

  const _T = () => {
    return (
      <div className={`tw-flex tw-flex-col tw-items-center tw-justify-center tw-box-border`}>
        <div className={`tw-flex`}>
          <div className="header-cell nb-r"></div>
          <div className="header-cell nb-r nb-l nb-b"></div>
          <div className="header-cell nb-l"></div>
        </div>
        <div className="header-cell nb-t" ></div>
        <div className="header-cell nb-t nb-b" ></div>
        <div className="header-cell nb-t nb-b" ></div>
        <div className="header-cell nb-t nb-b" ></div>
        <div className="header-cell nb-t nb-t" ></div>
      {/* // </div> */}
      </div>
    );
  }
  const _E = () => {
    return (
      <div className={`tw-flex tw-flex-col tw-items-center tw-justify-center tw-box-border`}>
        <div className={`tw-flex tw-gap-0`}>
          
          <div className="header-cell nb-r"></div>
          <div className="header-cell nb-l nb-r"></div>
          <div className="header-cell nb-l nb-r"></div>
          <div className="header-cell nb-l"></div>
          
        </div>
        <div className={`tw-flex tw-gap-0`}>
          <div className="header-cell empty"></div>
          <div className="header-cell nb-b nb-t"></div>
          <div className="header-cell empty"></div>
          <div className="header-cell empty"></div>
        </div>
        <div className={`tw-flex tw-gap-0`}>
          <div className="header-cell empty"></div>
          <div className="header-cell nb-t nb-r"></div>
          <div className="header-cell nb-r nb-l"></div>
          <div className="header-cell nb-l"></div>
        </div>
        <div className={`tw-flex tw-gap-0`}>
          <div className="header-cell empty"></div>
          <div className="header-cell nb-t nb-b"></div>
          <div className="header-cell empty"></div>
          <div className="header-cell empty"></div>
        </div>
        <div className={`tw-flex tw-gap-0`}>
          <div className="header-cell empty"></div>
          <div className="header-cell nb-t nb-r"></div>
          <div className="header-cell nb-r nb-l"></div>
          <div className="header-cell nb-l"></div>
        </div>

      </div>
    );
  }

  const _R = () => {
    return (
      <div className={`tw-relative tw-items-center tw-justify-center tw-box-border`}>

        <div className={`tw-flex tw-gap-0`}>
          <div className="header-cell nb-r"></div>
          <div className="header-cell nb-r nb-l"></div>
          <div className="header-cell nb-b nb-l"></div>
        </div>
        <div className={`tw-flex tw-gap-0`}>
          <div className="header-cell empty"></div>
          <div className="header-cell empty"></div>
          <div className="header-cell nb-t"></div>
        </div>
        <div className="top--1 tw-relative tw-flex tw-flex-col tw-gap-0">
          <div className="header-cell nb-b nb-t"></div>
          <div className="header-cell nb-b nb-t"></div>
          <div className="header-cell nb-b nb-t"></div>
          <div className="header-cell nb-t"></div>
        </div>

        <div className="top--4 left-1 tw-flex tw-relative tw-flex-col tw-gap-0">
          <div className="tw-flex tw-gap-0">
            <div className="header-cell nb-b nb-l"></div>
            <div className="header-cell empty"></div>
          </div>
          <div className="tw-flex tw-gap-0">
            <div className="header-cell nb-l nb-r nb-t"></div>
            <div className="header-cell nb-l nb-b"></div>
          </div>
          <div className="tw-flex tw-gap-0">
            <div className="header-cell empty"></div>
            <div className="header-cell nb-t"></div>
          </div>
        </div>    
      </div>
    );
  }

  const _I = () => {
    return(
    <div className={`tw-flex tw-flex-col tw-gap-0 tw-items-center tw-justify-center tw-box-border`}>
        
        <div className="header-cell nb-b"></div>
        
        <div className="header-cell nb-t nb-b"></div>
        
        <div className="header-cell nb-t nb-b"></div>
        <div className="header-cell nb-t"></div>
        <div className="header-cell nb-t nb-b"></div>
        <div className="header-cell nb-t nb-b"></div>
        <div className="header-cell nb-t nb-b"></div>
        <div className="header-cell nb-t"></div>
        
        
      {/* // </div> */}
      </div>
    );
  }

  const _S = () => {
    return (
      <div className={`tw-items-center tw-justify-center tw-box-border`}>
        <div className={`tw-flex tw-gap-0`} >
          <div className="header-cell nb-r nb-b"></div>
          <div className="header-cell nb-l nb-r"></div>
          <div className="header-cell nb-l"></div>
        </div>
        <div className={`tw-flex tw-gap-0`} >
          <div className="header-cell nb-t nb-b"></div>
          <div className="header-cell empty"></div>
          <div className="header-cell empty"></div>
        </div>
        <div className={`tw-flex tw-gap-0`} >
          <div className="header-cell nb-r"></div>
          <div className="header-cell nb-l nb-r"></div>
          <div className="header-cell nb-l nb-b"></div>  
        </div>
        <div className={`tw-flex tw-gap-0`} >
          <div className="header-cell empty"></div>
          <div className="header-cell nb-r nb-b nb-t"></div>
          <div className="header-cell nb-t"></div>
        </div>
        <div className={`tw-flex tw-gap-0`} >
          <div className="header-cell nb-r"></div>
          <div className="header-cell nb-l nb-r nb-t"></div>
          <div className="header-cell nb-l nb-t"></div>  
        </div>
      </div>);
  }

  return (
    <div className="tw-relative tw-flex tw-items-start" style={{gap: `${1 * props.scale}rem`}}>
    { _T() }
    { _E() }
    { _T() }
    { _R() }
    { _I() }
    { _S() }
    </div>
  )
}
TetrisLogo.defaultProps = {
  scale: 0.5
}