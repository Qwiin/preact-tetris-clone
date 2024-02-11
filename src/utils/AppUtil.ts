/**
 * generates a Unique Identifier string with the µ-second value of 
 * `performance.now()` + random hash seperated by an underscore
 * @returns uid as string
 */
export function newUID(): string {
  const timestamp = Math.round(window.performance.now()).toString();
  const randomPart = Math.random().toString(36).substring(2, 15);
  return timestamp + "_"+ randomPart;
}


/**
 * Utility hash function to convert string to a number
 * @param str - any string
 * @returns 32-bit integer number
 */
function stringToInt32Hash(str: string) {
  let hash: number = 0;
  for (let i = 0; i < str.length; i++) {
      const char: number = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to Int32
  }
  return hash;
}

/**
 * Pseudo-random number generator
 * @param seedStr 
 * @returns float value between 0 and 1;
 */
export function pseudoRandom(seedStr: string) {
  const seed = stringToInt32Hash(seedStr);
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}