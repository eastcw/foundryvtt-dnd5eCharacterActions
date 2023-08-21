import { MODULE_ID } from './constants';

export function log(force, ...args) {
  const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MODULE_ID);
  if (shouldLog) {
    console.log(MODULE_ID, '|', ...args);
  }
}

export function getActivationType(activationType) {
  switch (activationType) {
    case 'action':
    case 'bonus':
    case 'crew':
    case 'lair':
    case 'legendary':
    case 'reaction':
      return activationType;
    default:
      return 'other';
  }
}

export function isActiveItem(activationType) {
  if (!activationType) {
    return false;
  }
  if (['minute', 'hour', 'day', 'none'].includes(activationType)) {
    return false;
  }
  return true;
}

export function getGame() {
  if (!(game instanceof Game)) {
    throw new Error('game is not initialized yet!');
  }
  return game;
}
