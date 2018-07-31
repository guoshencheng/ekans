import { App } from './app';
import { createConnect } from './connect';

export * from './connect';
export * from './model';
export * from './app';

export const instance = new App();
export const connect = createConnect({
  props: {
    getActions: instance.getActions,
    getReducerActions: instance.getReducerActions,
  }
});
