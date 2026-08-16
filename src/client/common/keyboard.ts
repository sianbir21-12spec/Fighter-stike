export interface KeyboardState {
  pressedKeys: { [key: string]: boolean };

  handlers: {
    keyUp: (ev: KeyboardEvent) => void;
    keyDown: (ev: KeyboardEvent) => void;
    mouseUp: (ev: MouseEvent) => void;
    mouseDown: (ev: MouseEvent) => void;
    contextMenu: (ev: MouseEvent) => void;
  };
}

const reset = (state: KeyboardState) => {
  const { pressedKeys } = state;
  for (const key in pressedKeys) {
    pressedKeys[key] = false;
  }
};

const keyDown = (state: KeyboardState, ev: KeyboardEvent) => {
  if (
    (ev.altKey || ev.shiftKey) &&
    (ev.code === 'KeyS' || ev.code === 'KeyW' || ev.code === 'KeyA' || ev.code === 'KeyD')
  ) {
    ev.preventDefault();
  }

  state.pressedKeys[ev.code] = true;
};

const keyUp = (state: KeyboardState, ev: KeyboardEvent) => {
  state.pressedKeys[ev.code] = false;
};

const mouseDown = (state: KeyboardState, ev: MouseEvent) => {
  // Left mouse button is an alternative fire control.
  if (ev.button === 0) {
    state.pressedKeys.MouseLeft = true;
  }
};

const mouseUp = (state: KeyboardState, ev: MouseEvent) => {
  if (ev.button === 0) {
    state.pressedKeys.MouseLeft = false;
  }
};

const contextMenu = (ev: MouseEvent) => {
  // Prevent the browser context menu while playing.
  ev.preventDefault();
};

const enable = (): KeyboardState => {
  const state: KeyboardState = {
    pressedKeys: {},
    handlers: {
      keyUp: () => {},
      keyDown: () => {},
      mouseUp: () => {},
      mouseDown: () => {},
      contextMenu: () => {},
    },
  };

  state.handlers.keyUp = keyUp.bind(undefined, state);
  state.handlers.keyDown = keyDown.bind(undefined, state);
  state.handlers.mouseUp = mouseUp.bind(undefined, state);
  state.handlers.mouseDown = mouseDown.bind(undefined, state);
  state.handlers.contextMenu = contextMenu;

  window.addEventListener('keyup', state.handlers.keyUp);
  window.addEventListener('keydown', state.handlers.keyDown);
  window.addEventListener('mouseup', state.handlers.mouseUp);
  window.addEventListener('mousedown', state.handlers.mouseDown);
  window.addEventListener('contextmenu', state.handlers.contextMenu);

  return state;
};

const disable = (state: KeyboardState) => {
  window.removeEventListener('keyup', state.handlers.keyUp);
  window.removeEventListener('keydown', state.handlers.keyDown);
  window.removeEventListener('mouseup', state.handlers.mouseUp);
  window.removeEventListener('mousedown', state.handlers.mouseDown);
  window.removeEventListener('contextmenu', state.handlers.contextMenu);
};

const getPressedKeys = (state: KeyboardState) => {
  return Object.entries(state.pressedKeys)
    .filter((entry) => entry[1])
    .map((entry) => entry[0]);
};

export const keyboard = {
  enable,
  disable,
  getPressedKeys,
  reset,
};
