import { animate } from "framer-motion";
import { Ref } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import { AppContext, GameStateAPI } from "./AppProvider";

const OptionsModal = () => {

  const [isOpen, setIsOpen] = useState(false);
  const self: Ref<HTMLDivElement> = useRef(null);
  const button: Ref<HTMLDivElement> = useRef(null);
  const appContext = useContext(AppContext) as GameStateAPI;

  const slideOut = ()=> {
    animate(
      "#OptionsModal", 
      { 
        transform: [`translateY(-84%) scale(100%)`,`translateY(0%) scale(75%)`],
        boxShadow: ['0rem -2rem 0.5rem 8rem #0009','0rem -0.1rem 0.1rem 0.1rem #0006']
        // borderRadius: [`20rem`,`40rem`],
        // width: ["90%", "150%"],

      }, 
      { 
        duration: 0.3,
        ease: "easeOut",
        delay: 0
      });
  }
  const slideIn = ()=> {
    animate(
      "#OptionsModal", 
      { 
        transform: [`translateY(0%) scale(75%)`,`translateY(-84%) scale(100%)`],
        boxShadow: ['0rem -0.1rem 0.1rem 0.1rem #0006','0rem -2rem 0.5rem 8rem #0009']
        // borderRadius: [`40rem`,`20rem`],
        // width: ["150%", "90%"],
      }, 
      { 
        duration: 0.3,
        ease: "easeOut",
        delay: 0
      });
  }

useEffect(()=>{
  if(isOpen) {
    self.current?.classList.remove('close');
    self.current?.classList.add('open');
    button.current?.classList.remove('close');
    button.current?.classList.add('open');
    appContext.api.pauseGame();
    slideIn();
  }
  else if(!isOpen) {
    self.current?.classList.remove('open');
    self.current?.classList.add('close');
    button.current?.classList.remove('open');
    button.current?.classList.add('close');
    // appContext.api.resumeGame();
    slideOut();
  }
},[isOpen]);

useEffect(()=>{
  if(appContext.props.showOptions) {
    setIsOpen(true);
  }
  else {
    setIsOpen(false);
  }
},[appContext.props.showOptions]);

  const toggleOpen = () => {

    if(!isOpen) {
      appContext.api.showOptions();
    }
    else {
      appContext.api.hideOptions();
    }
    // self.current?.classList.remove(isOpen ? 'open' : 'close');
    // self.current?.classList.add(isOpen ? 'close' : 'open');
    // button.current?.classList.remove(isOpen ? 'open' : 'close');
    // button.current?.classList.add(isOpen ? 'close' : 'open');
    // setIsOpen( !isOpen );
  }

  return (

    <div ref={self} id="OptionsModal">
      <div ref={button} id="OptionsOpenButton" className="close" onClick={toggleOpen}></div>
    </div>
  );
}
export default OptionsModal