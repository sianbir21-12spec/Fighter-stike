import { AppState } from '../types';
import { AnyServerMsg, ServerMsg } from '../../gameServer/messages';
import { Cmd, cmd } from '../commands';
import { msg } from '../messages';
import { message as gameMessage } from '../game/actions/message';
import { message as observerMessage } from '../observer/reducer';
import { start as startGame } from '../game';
import { start as startObserver } from '../observer/start';

export const joinGame = (appState: AppState, url: string): Cmd => {
  const type = appState.query.observer ? 'observer' : 'player';
  appState.tryJoin = {
    url,
    type,
  };
  return cmd.connectToGameServer(url);
};

export const connected = (appState: AppState): Cmd => {
  if (appState.type !== 'gameSelect' || !appState.tryJoin || !appState.token) {
    return;
  }

  const {
    tryJoin: { type },
    token,
  } = appState;

  if (type === 'player') {
    return [cmd.renderUI(), cmd.sendMsg(msg.joinGame(token))];
  } else if (type === 'observer') {
    return [cmd.renderUI(), cmd.sendMsg(msg.joinGameAsObserver(token))];
  } else if (type === 'bot' && appState.name) {
    return [cmd.renderUI(), cmd.sendMsg(msg.joinGameAsBot(appState.name, -1))];
  }
};

export const message = (appState: AppState, msg: AnyServerMsg): Cmd => {
  if (appState.type === 'game' && appState.game) {
    return gameMessage(appState.game, msg);
  } else if (appState.type === 'observer' && appState.observer) {
    return observerMessage(appState.observer, msg);
  }

  switch (msg.type) {
    case 'connect':
      return saveConnectId(appState, msg);
    case 'startData':
      return startData(appState, msg);
    case 'startObserverData':
      return startObserverData(appState, msg);
    case 'gameJoinFail':
      return gameJoinFail(appState, msg);
  }
};

const saveConnectId = (appState: AppState, msg: ServerMsg['connect']): Cmd => {
  appState.id = msg.id;
};

const startData = (appState: AppState, msg: ServerMsg['startData']): Cmd => {
  appState.type = 'game';
  appState.tryJoin = undefined;
  startGame(msg);
};

const startObserverData = (appState: AppState, msg: ServerMsg['startObserverData']): Cmd => {
  appState.type = 'observer';
  appState.tryJoin = undefined;
  startObserver(appState, msg);
};

const gameJoinFail = (appState: AppState, _msg: ServerMsg['gameJoinFail']): Cmd => {
  const reason = 'Could not join this game. Your previous session was replaced or the room is full. Please click the city again to retry.';
  appState.tryJoin = undefined;

  // The original UI silently returned to the menu, which made a failed join
  // look like a dead button. Give the player an explicit retry explanation.
  if (typeof window !== 'undefined') {
    window.setTimeout(() => window.alert(reason), 0);
  }

  return cmd.renderUI();
};
