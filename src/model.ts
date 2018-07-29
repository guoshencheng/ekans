import { Dispatch as ReduxDispatch } from 'redux';

export type ModelMap<State> = {
  [key: string]: Model<State>
}

export type ModelHandler<State> = (state: State, payload: any) => any

export type ModelHandlerMap<State> = {
  [key: string]: ModelHandler<State>
}

export type ReduxReducer<State> = (state: State, action: any) => any;

export type OriginReducer<State> = {
  [key: string]: ReduxReducer<State>
}

export interface ModelOptions<State> {
  defaultState: State;
  prefix?: string;
  handlers?: { [key: string]: Model<any> | ModelHandler<State> }
}

export type ModelReduxAction = {
  type: string,
  payload?: any
}

export class Model<State> {
  $parent?: Model<any>;
  $root?: Model<any>;
  $defaultState: State;
  $prefix: string;
  $models: ModelMap<any>;
  $handlers: ModelHandlerMap<State>;
  $originReducer: OriginReducer<State>;

  constructor({ defaultState, prefix, handlers }: ModelOptions<State>) {
    this.$defaultState = defaultState || {};
    this.$prefix = prefix || '@m-react-redux';
    this.$models = {};
    this.$handlers = {};
    this.$originReducer = {};
    if (handlers) {
      this.handlers(handlers);
    }
  }

  handleOriginReducer(key: string, handler: ReduxReducer<State>): void {
    if (handler && typeof handler === 'function') {
      this.$originReducer[key] = handler;
    }
  }

  handle(key: string, handler: Model<any> | ModelHandler<State>) {
    if (handler) {
      if (handler instanceof Model) {
        handler.$parent = this;
        handler.$root = this.$root || this;
        this.$models[key] = handler;
      } else if (typeof handler === 'function') {
        this.$handlers[key] = handler;
      }
    }
  }

  handlers(handlers: { [key: string]: Model<any> | ModelHandler<State> }) {
    Object.keys(handlers).forEach((key: string) => {
      this.handle(key, handlers[key]);
    })
  }

  toReducerAction(dispatch: ReduxDispatch<ModelReduxAction>, prefix?: string): any {
    prefix = prefix || this.$prefix;
    let actions = {};
    /**
     * 原数据 { [string]: handler }
     * 处理后 acions[string] = (value) => dispatch({ key: prefix+string, payload: value });
     */
    Object.keys(this.$handlers).forEach((key: string) => {
      actions[key] = (payload) => dispatch({
        type: `${prefix}/${key}`,
        payload: payload
      })
    })
    // 将子reducer的处理后的actions，关联到当前的actions上
    Object.keys(this.$models).forEach((key: string) => {
      actions[key] = this.$models[key].toReducerAction(dispatch, `${prefix}/${key}`);
    })
    return actions;
  }

  toReduxReducers(prefix: string): ReduxReducer<State> {
    prefix = prefix || this.$prefix;
    const handlers = {};
    Object.keys(this.$handlers).forEach((key: string) => {
      handlers[`${prefix}/${key}`] = this.$handlers[key];
    });
    return (state: any, action: ModelReduxAction) => {
      let nextState = { ...(state || this.$defaultState) };

      // 使用当前reducer的处理函数处理后返回新的state
      if (handlers[action.type]) {
        nextState = handlers[action.type](state, action.payload);
      }

      // 使用redux的原reducer处理当前的state的子节点
      Object.keys(this.$originReducer)
        .filter((key: string) => {
          const reducer = this.$originReducer[key];
          return Boolean(reducer) && typeof reducer === 'function';
        }).forEach((key: string) => {
          const reducer = this.$originReducer[key];
          nextState[key] = reducer(nextState[key], action);
        });

      // 递归的让子reducer进行处理当前state的子节点
      Object.keys(this.$models)
        .filter((key: string) => Boolean(this.$models[key]))
        .forEach(key => {
          const model = this.$models[key];
          nextState[key] = model.toReduxReducers(`${prefix}/${key}`)(nextState[key], action);
        })
      return nextState;
    }
  }

}
