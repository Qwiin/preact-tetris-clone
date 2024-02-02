import { PieceQueItem } from "./components/Game";
import { rotateMatrix } from "./GameUtils";
import { Direction } from "./TetrisConfig";

export enum MovementTrigger {
  GRAVITY=1,
  INPUT_DOWN,
  INPUT_LATERAL,
  INPUT_DROP,
  INPUT_SET,  // pressing down arrow when piece can't move down will set it in place
}

export default class ActivePiece {


  // flag to indicate if the piece was moved by gravity (time)
  // or moved by user input;
  lastMoveTrigger: MovementTrigger = MovementTrigger.GRAVITY;

  // dropped: boolean = false;

  readonly xMax: number = 10;
  readonly xMin: number = 0;
  readonly yMax: number = 24;
  readonly yMin: number = 0;

  private _coordsPrev: number[][] = [];
  public set coordsPrev(value: number[][]) {
    this._coordsPrev = value;
  }
  public get coordsPrev(): number[][] {
    return this._coordsPrev;
  }

  private _coords: number[][] = [];
  public set coords(value: number[][]) {
    this._coords = value;
  }
  public get coords(): number[][] {
    return this._coords;
  }

  lastTick: number = -1;

  x: number = 4;
  xPrev: number = 4;
  y: number = 4;
  yPrev: number = -1;

  private _rotation: Direction = Direction.N;
  public get rotation(): Direction {
    return this._rotation;
  }
  public set rotation(value: Direction) {
    this._rotation = value;
    this.permutation
  }

  private _rotationPrev: Direction = Direction.N;
  public get rotationPrev(): Direction {
    return this._rotationPrev
  }
  public set rotationPrev(value: Direction) {
    this._rotationPrev = value;
  }

  readonly id: string = "";
  readonly shape: number[][] = [];

  readonly shapeByDirection: number[][][] = [];

  constructor(item?: PieceQueItem, rotation?: Direction, coords?: number[][], x?: number, y?: number) {

    if(item) {
      this.shape = item.piece;
      this.id = item.id;
      this.shapeByDirection[Direction.N] = this.shape;
      if(rotation) {
        this._rotation = rotation;
        this._rotationPrev = rotation;
      }
      if(x) {
        this.x = Math.floor((10 - this.shape[0].length) / 2);
        this.xPrev = this.x;
      }
      if(y) {
        this.y = y;
        this.yPrev = y-1;
      }else {
        this.y = this.height + 3;
      }
      if(coords) {
        this.coords = coords;
        this.coordsPrev = [...coords];
      }
    }
  }

  rotateLeft() {
    this._rotationPrev = this._rotation;
    if(this.rotation === Direction.N) {
      this.rotation = Direction.W;
    }
    else {
      this.rotation -= 1;
    }
    this.xAdjustAfterRotation();
    this.yAdjustAfterRotation();

    // this._coordsPrev = JSON.parse(JSON.stringify(this._coords));
    // this._coords = rotateMatrix(this._coords, 4);
  }

  rotateRight() {
    this._rotationPrev = this._rotation;
    if(this.rotation === Direction.W) {
      this.rotation = Direction.N;
    }
    else {
      this.rotation += 1;
    }
    this.xAdjustAfterRotation();
    this.yAdjustAfterRotation();

    // this._coordsPrev = JSON.parse(JSON.stringify(this._coords));
    // this._coords = rotateMatrix(this._coords, 2);
  }

  private xAdjustAfterRotation() {
    // console.log({'rotationChange': `${this.rotationPrev} -> ${this.rotation}`});
    // console.log({'       xChange': `${this.xPrev} -> ${this.x}`});
    // console.log({'       yChange': `${this.yPrev} -> ${this.y}`});
    let dWidth = this.width - this.widthPrev;
    if(dWidth !== 0) {
      

      // TODO: clean up

      let newX: number = (this.rotation === Direction.E) 
        ? (this.x + 1) 
        : (this.rotation !== this.rotationPrev && this.rotationPrev === Direction.E) 
          ? this.x - 1
          : this.x;

      if(this.width === 1) {
        if (this.rotation === Direction.E) {
          newX = this.x + 2;
        }
        else if (this.rotation === Direction.W) {
          newX = this.x + 1;
        }
      }
      else if(this.width === 4) { 
        if(this.rotationPrev === Direction.E) {
          newX = this.x - 2;
        }
        if(this.rotationPrev === Direction.W) {
          newX = this.x - 1;
        }
      }

      this.xPrev = this.x;
      if(newX < this.xMin) {
        this.x = this.xMin;
      }
      else if(newX > this.xMax - this.width) {
        this.x = this.xMax - this.width;
      }
      else {
        this.x = newX;
      }
    }
  }
  private yAdjustAfterRotation() {
    // console.log({'rotationChange': `${this.rotationPrev} -> ${this.rotation}`});
    // console.log({'       xChange': `${this.xPrev} -> ${this.x}`});
    // console.log({'       yChange': `${this.yPrev} -> ${this.y}`});
    let dHeight = this.height - this.heightPrev;
    if(dHeight !== 0) {
      // let d: number = this.y;// - Math.abs(dHeight * (Math.sin(Math.PI / 2 * (this.rotation - 1))));

      let newY: number = (this.rotation !== this.rotationPrev && this.rotationPrev === Direction.N) 
        ? (this.y + 1) 
        : (this.rotation === Direction.N) 
          ? this.y - 1
          : this.y;


      if(newY < this.yMin) {
        this.y = this.yMin;
      }
      else if(newY >= this.yMax) {
        this.y = this.yMax;
      }
      else {
        this.y = newY;
      }
      this.yPrev = this.y - 1;
    }
  }

  get permutationPrev(): number[][] {
    if(!this.shapeByDirection[this.rotationPrev]){
      this.shapeByDirection[this.rotationPrev] = rotateMatrix(this.shape, this.rotationPrev);
    }

    return this.shapeByDirection[this.rotationPrev];
  }

  get permutation(): number[][] {
    if(!this.shapeByDirection[this.rotation]){
      this.shapeByDirection[this.rotation] = rotateMatrix(this.shape, this.rotation);
    }

    return this.shapeByDirection[this.rotation];
  }

  get height(): number {
    return this.permutation.length;
  }
  get heightPrev(): number {
    return this.permutationPrev.length;
  }

  get width(): number {
    return this.permutation[0].length;
  }
  get widthPrev(): number {
    return this.permutationPrev[0].length;
  }

  getWidthProjection(): number {
    return this.permutation[0].length 
  }
}