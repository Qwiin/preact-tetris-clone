export function debounce(callback: Function, delay: number, immediate: boolean = false, repeat: boolean = false) {
  // Write your code here.

  let debounceTimeout: any = null;

  return function (...args: any) {
    // @ts-ignore
    const context = this;

    console.log({args: [...args]});
  
    if(immediate) {
      // console.log("immediate!!!");
      if(!debounceTimeout) {
        // console.log("  -> callback called");
        callback.apply(context, args);
        
      }

      /**
        The conditions for this problem were confusing to
        me, so for my own memory here is how the logic works:

        basically, if immediate is set, the function is not 
        called again until there has been a pause longer than 
        the value of `delay` BETWEEN debounced() calls.
      */
      if(!repeat){
        clearTimeout(debounceTimeout);
      }
      debounceTimeout = setTimeout(()=>{
        clearTimeout(debounceTimeout);
        debounceTimeout = null;
        // console.log("debounceTimeout cleared");
        // callback.apply(context, args);
      }, delay);
    }
    else {
      if(!repeat) {
        clearTimeout(debounceTimeout);
      }
      debounceTimeout = setTimeout(()=>{
        callback.apply(context, args);
      }, delay);
    }
  }
}

