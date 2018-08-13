import { EventEmitter } from 'fbemitter'
import { Model, ReduxReducer, MapModelDispatchBindedAction } from './model';
import * as React from 'react';
import { Middleware, Store, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from './thunk';

export interface AppOptions<State, Extra> {
  extra?: Extra;
  model?: Model<State>;
  middlewares?: Middleware[];
}
export class App<State, Extra extends any> extends EventEmitter {
  $extra: Extra;
  static FINISH_INIT = 'FINISH_INIT'
  static BEFORE_INIT = 'BEFORE_INIT'
  $model?: Model<State>;
  $middlewares: Middleware[];
  $reduxReducer: ReduxReducer<State>;
  store: Store<State>;
  $actions: MapModelDispatchBindedAction<any>;
  $reducerActions: MapModelDispatchBindedAction<any>;
  constructor(opt?: AppOptions<State, Extra>) {
    super();
    const { model, middlewares, extra } = opt || { middlewares: [], model: undefined, extra: {} };
    this.$extra = extra || {} as any;
    this.middlewares(middlewares as Middleware[]);
    this.$model = model;
    this.$reduxReducer = (state) => state;
  }
  Provider = ({ children }) => {
    return (
      <Provider store={this.store}>
        { children }
      </Provider>
    )
  }
  init() {
    if (!this.$model) {
      console.log(`model不能为空 请先使用 app.model(model) 来设置model`)
      return;
    }
    this.emit(App.BEFORE_INIT, this);
    this.$reduxReducer = this.$model.toReduxReducers();
    this.store = createStore(this.$reduxReducer, composeWithDevTools(applyMiddleware(...this.$middlewares)))
    this.$actions = this.$model.toReduxActions(this.store.dispatch);
    this.$reducerActions = this.$model.toReducerAction(this.store.dispatch);
    this.emit(App.FINISH_INIT, this);
  }
  getExtra = (): Extra => {
    return this.$extra;
  }
  getActions = (): MapModelDispatchBindedAction<any> => {
    return this.$actions;
  }
  getReducerActions = (): MapModelDispatchBindedAction<any> => {
    return this.$reducerActions;
  }
  model(model: Model<State>) {
    this.$model = model;
    this.$reduxReducer = this.$model.toReduxReducers();
    if (this.store) {
      this.$actions = this.$model.toReduxActions(this.store.dispatch);
      this.$reducerActions = this.$model.toReducerAction(this.store.dispatch);
    }
  }
  middlewares(middlewares: Middleware[]) {
    middlewares = middlewares || [];
    this.$middlewares = [ thunk.withExtraArgument(this), ...middlewares ];
  }
}
