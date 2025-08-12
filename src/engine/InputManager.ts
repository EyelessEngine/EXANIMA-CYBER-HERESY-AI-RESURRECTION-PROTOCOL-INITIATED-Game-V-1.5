export interface InputState {
  keys: { [key: string]: boolean };
  mouseButtons: { left: boolean; right: boolean; middle: boolean };
  mouseDelta: { x: number; y: number };
  mousePos: { x: number; y: number };
}

export class InputManager {
  private inputState: InputState;
  private canvas: HTMLCanvasElement;
  private isPointerLocked: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.inputState = {
      keys: {},
      mouseButtons: { left: false, right: false, middle: false },
      mouseDelta: { x: 0, y: 0 },
      mousePos: { x: 0, y: 0 }
    };

    this.setupEventListeners();
    this.requestPointerLock();
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.inputState.keys[e.code] = true;
      e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
      this.inputState.keys[e.code] = false;
      e.preventDefault();
    });

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.isPointerLocked) {
        this.requestPointerLock();
      }
      
      switch (e.button) {
        case 0: this.inputState.mouseButtons.left = true; break;
        case 1: this.inputState.mouseButtons.middle = true; break;
        case 2: this.inputState.mouseButtons.right = true; break;
      }
      e.preventDefault();
    });

    document.addEventListener('mouseup', (e) => {
      switch (e.button) {
        case 0: this.inputState.mouseButtons.left = false; break;
        case 1: this.inputState.mouseButtons.middle = false; break;
        case 2: this.inputState.mouseButtons.right = false; break;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.inputState.mouseDelta.x = e.movementX || 0;
        this.inputState.mouseDelta.y = e.movementY || 0;
      }
      
      this.inputState.mousePos.x = e.clientX;
      this.inputState.mousePos.y = e.clientY;
    });

    // Pointer lock events
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.canvas;
    });

    document.addEventListener('pointerlockerror', () => {
      console.warn('Pointer lock failed');
    });

    // Context menu prevention
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  private requestPointerLock(): void {
    this.canvas.requestPointerLock();
  }

  public getInput(): InputState {
    // Reset mouse delta after reading
    const currentInput = { ...this.inputState };
    this.inputState.mouseDelta = { x: 0, y: 0 };
    return currentInput;
  }

  public isKeyPressed(key: string): boolean {
    return !!this.inputState.keys[key];
  }

  public isMouseButtonPressed(button: 'left' | 'right' | 'middle'): boolean {
    return this.inputState.mouseButtons[button];
  }
}