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