export interface KeyboardState {
  pressedKeys: { [key: string]: boolean };

  handlers: {
    keyUp: (ev: KeyboardEvent) => void;
    keyDown: (ev: KeyboardEvent) => void;
    mouseUp: (ev: MouseEvent) => void;
    mouseDown: (ev: MouseEvent) => void;
    blur: () => void;
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

  // Prevent Space from scrolling the page while playing.
  if (ev.code === 'Space') {
    ev.preventDefault();
  }

  state.pressedKeys[ev.code] = true;
};

const keyUp = (state: KeyboardState, ev: KeyboardEvent) => {
  state.pressedKeys[ev.code] = false;
};

const mouseDown = (state: KeyboardState, ev: MouseEvent) => {
  if (ev.button === 0) {
    ev.preventDefault();
    state.pressedKeys['MouseLeft'] = true;
  }
};

const mouseUp = (state: KeyboardState, ev: MouseEvent) => {
  if (ev.button === 0) {
    state.pressedKeys['MouseLeft'] = false;
  }
};

const enable = (): KeyboardState => {
  const state: KeyboardState = {
    pressedKeys: {},
    handlers: {
      keyUp: () => {},
      keyDown: () => {},
      mouseUp: () => {},
      mouseDown: () => {},
      blur: () => {},
    },
  };

  state.handlers.keyUp = keyUp.bind(undefined, state);
  state.handlers.keyDown = keyDown.bind(undefined, state);
  state.handlers.mouseUp = mouseUp.bind(undefined, state);
  state.handlers.mouseDown = mouseDown.bind(undefined, state);
  state.handlers.blur = reset.bind(undefined, state);

  window.addEventListener('keyup', state.handlers.keyUp);
  window.addEventListener('keydown', state.handlers.keyDown);
  window.addEventListener('mouseup', state.handlers.mouseUp);
  window.addEventListener('mousedown', state.handlers.mouseDown);
  window.addEventListener('blur', state.handlers.blur);

  return state;
};

const disable = (state: KeyboardState) => {
  window.removeEventListener('keyup', state.handlers.keyUp);
  window.removeEventListener('keydown', state.handlers.keyDown);
  window.removeEventListener('mouseup', state.handlers.mouseUp);
  window.removeEventListener('mousedown', state.handlers.mouseDown);
  window.removeEventListener('blur', state.handlers.blur);
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
