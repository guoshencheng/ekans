import { Dispatch as ReduxDispatch } from 'redux';

export type ReducerMap<State> = {
  [key: string]: Reducer<State>
}

export type ReducerHandler<State> = (state: State, payload: any) => any

export type ReducerHandlerMap<State> = {
  [key: string]: ReducerHandler<State>
}

export type ReduxReducer<State> = (state: State, action: any) => any;

export type OriginReducer<State> = {
  [key: string]: ReduxReducer<State>
}

export interface ReducerOptions<State> {
  defaultState: State;
  prefix?: string;
}

export type ReducerAction = {
  type: string,
  payload?: any
}

export class Reducer<State> {
  $defaultState: State;
  $prefix: string;
  $reducers: ReducerMap<any>;
  $handlers: ReducerHandlerMap<State>;
  $originReducer: OriginReducer<State>;

  constructor({ defaultState, prefix }: ReducerOptions<State>) {
    this.$defaultState = defaultState || {};
    this.$prefix = prefix || '@m-react-redux';
    this.$reducers = {};
    this.$handlers = {};
    this.$originReducer = {};
  }

  hanleOriginReducer(key: string, handler: ReduxReducer<State>): void {
    if (handler && typeof handler === 'function') {
      this.$originReducer[key] = handler;
    }
  }

  hanle(key: string, handler: Reducer<any> | ReducerHandler<State>) {
    if (handler) {
      if (handler instanceof Reducer) {
        this.$reducers[key] = handler;
      } else if (typeof handler === 'function') {
        this.$handlers[key] = handler;
      }
    }
  }

  toReducerAction(dispatch: ReduxDispatch<ReducerAction>, prefix?: string): any {
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
    Object.keys(this.$reducers).forEach((key: string) => {
      actions[key] = this.$reducers[key].toReducerAction(dispatch, `${prefix}/${key}`);
    })
    return actions;
  }

  toReduxReducers(prefix: string): ReduxReducer<State> {
    prefix = prefix || this.$prefix;
    const handlers = {};
    Object.keys(this.$handlers).forEach((key: string) => {
      handlers[`${prefix}/${key}`] = this.$handlers[key];
    });
    return (state: any, action: ReducerAction) => {
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
      Object.keys(this.$reducers)
        .filter((key: string) => Boolean(this.$reducers[key]))
        .forEach(key => {
          const reducer = this.$reducers[key];
          nextState[key] = reducer.toReduxReducers(`${prefix}/${key}`)(nextState[key], action);
        })
      return nextState;
    }
  }

}
