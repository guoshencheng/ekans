import { Model, ReduxReducer, MapModelDispatchBindedAction } from './model';
import { Middleware, Store, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

export interface AppOptions<State> {
  model?: Model<State>;
  middlewares?: Middleware[];
}
export class App<State> {
  $model?: Model<State>;
  $middlewares: Middleware[];
  $reduxReducer: ReduxReducer<State>;
  store: Store<State>;
  $actions: MapModelDispatchBindedAction<any>;
  $reducerActions: MapModelDispatchBindedAction<any>;
  constructor(opt?: AppOptions<State>) {
    const { model, middlewares } = opt || { middlewares: [], model: undefined };
    this.$middlewares = middlewares || [];
    this.$model = model;
    this.$reduxReducer = (state) => state;
  }
  init() {
    if (!this.$model) {
      console.log(`model不能为空 请先使用 app.model(model) 来设置model`)
      return;
    }
    this.$reduxReducer = this.$model.toReduxReducers();
    this.store = createStore(this.$reduxReducer, composeWithDevTools(applyMiddleware(...this.$middlewares)))
    this.$actions = this.$model.toReduxActions(this.store.dispatch);
    this.$reducerActions = this.$model.toReducerAction(this.store.dispatch);
  }
  getActions(): MapModelDispatchBindedAction<any> {
    return this.$actions;
  }
  getReducerActions(): MapModelDispatchBindedAction<any> {
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
    this.$middlewares = middlewares;
  }
}
