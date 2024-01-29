import { Direction } from "./TetrisConfig";

export const rotateMatrix = (matrix: number[][], toDirection: Direction | number): number[][] => {

  if(toDirection === Direction.N){
    return JSON.parse(JSON.stringify(matrix));
  }

  let matrixT: number[][] = [];
  const nR = matrix.length;
  const nC = matrix[0].length;

  let iT=0;
  
  switch(toDirection) {

    // forward cols, reverse rows
    case Direction.E:

      for(let i=0; i<nC; i++) {
        matrixT[iT] = [];
        for(let j=nR-1; j>=0; j--) {
          matrixT[iT].push(matrix[j][i]);
        }
        // console.log(JSON.stringify(matrixT[iT]));
        iT++;
      }
      break;


    // reverse rows, reverse cols
    case Direction.S:

      for(let i=nR-1; i>=0; i--) {
        matrixT[iT] = [];
        for(let j=nC-1; j>=0; j--) {
          matrixT[iT].push(matrix[i][j]);
        }
        // console.log(JSON.stringify(matrixT[iT]));
        iT++;
      }
      break;


    // reverse cols, forward rows
    case Direction.W: 
    
      for(let i=nC-1; i>=0; i--) {
      matrixT[iT] = [];
      for(let j=0; j<nR; j++) {
          matrixT[iT].push(matrix[j][i]);
        }
        // console.log(JSON.stringify(matrixT[iT]));
        iT++;
      }
      break;
  }

  return matrixT;
}